import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Blob "mo:core/Blob";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

// Apply migration via with-clause

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Type definitions
  type UserId = Principal;
  type City = Text;
  type ChatId = Nat;

  public type Gender = { #male; #female };
  public type SubscriptionPlan = { #plan98; #plan199; #plan399; #none };

  public type Profile = {
    owner : UserId;
    name : Text;
    bio : Text;
    city : City;
    interests : [Text];
    profilePhoto : ?Image;
    gender : ?Gender;
    connectWith : ?Gender;
  };

  public type Subscription = {
    plan : SubscriptionPlan;
    startTime : Int;
    expiryTime : ?Int; // Only for ₹399 plan
  };

  public type Image = {
    blob : Storage.ExternalBlob;
    name : Text;
    fileType : Text;
  };

  public type UserProfileUpdate = {
    name : Text;
    bio : Text;
    city : City;
    interests : [Text];
    profilePhoto : ?Image;
    gender : Gender;
    connectWith : Gender;
  };

  public type ChatMessage = {
    sender : UserId;
    content : Text;
    timestamp : Int;
  };

  public type Chat = {
    id : ChatId;
    participant1 : UserId;
    participant2 : UserId;
    messages : [ChatMessage];
  };

  // Storage
  let profiles = Map.empty<UserId, Profile>();
  let chats = Map.empty<ChatId, Chat>();
  let blockedUsers = Map.empty<UserId, List.List<UserId>>();
  let reportedUsers = Map.empty<UserId, Nat>();
  let initiatedChats = Map.empty<UserId, Nat>(); // Track number of chats initiated by each user
  let subscriptions = Map.empty<UserId, Subscription>();
  var nextChatId = 0;

  module Profile {
    public func compareByName(profile1 : Profile, profile2 : Profile) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };
  };

  // User profile functions (frontend-required interface)
  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    // Users can view any profile (for discovery), but not blocked users
    if (isUserBlockedBy(caller, user) or isUserBlockedBy(user, caller)) {
      return null;
    };

    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfileUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let newProfile : Profile = {
      owner = caller;
      name = profile.name;
      bio = profile.bio;
      city = profile.city;
      interests = profile.interests;
      profilePhoto = profile.profilePhoto;
      gender = ?profile.gender;
      connectWith = ?profile.connectWith;
    };

    profiles.add(caller, newProfile);
  };

  // Legacy profile functions (keeping for backward compatibility)
  public shared ({ caller }) func createOrUpdateProfile(update : UserProfileUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to update profile");
    };

    let newProfile : Profile = {
      owner = caller;
      name = update.name;
      bio = update.bio;
      city = update.city;
      interests = update.interests;
      profilePhoto = update.profilePhoto;
      gender = ?update.gender;
      connectWith = ?update.connectWith;
    };

    profiles.add(caller, newProfile);
  };

  public query ({ caller }) func getOwnProfile() : async Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required to view profile");
    };

    switch (profiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("No profile found") };
    };
  };

  public query ({ caller }) func getAllUserProfiles() : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    profiles.values().toArray().sort(Profile.compareByName);
  };

  // User discovery functions with filtering
  public query ({ caller }) func getProfilesByCity(city : City) : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required to discover user profiles");
    };

    let currentUserGenderPreference = switch (profiles.get(caller)) {
      case (?currentUserProfile) { currentUserProfile.connectWith };
      case (null) { null };
    };

    profiles.values().toArray().filter(
      func(profile) {
        (profile.city == city)
        and (profile.owner != caller)
        and (not isUserBlockedBy(caller, profile.owner))
        and (not isUserBlockedBy(profile.owner, caller))
        and matchGenderPreference(profile, currentUserGenderPreference)
      }
    );
  };

  func matchGenderPreference(profile : Profile, connectWith : ?Gender) : Bool {
    switch (connectWith, profile.gender) {
      case (?targetGender, ?profileGender) {
        targetGender == profileGender;
      };
      case (_) { false };
    };
  };

  // New subscription fundamental functions
  public shared ({ caller }) func activatePlan(plan : SubscriptionPlan) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to activate a plan");
    };

    // Check plan is valid
    switch (plan) {
      case (#none) {
        Runtime.trap("Invalid plan selection, must choose a valid plan");
      };
      case (_) {
        let now = Time.now();
        let subscription : Subscription = {
          plan;
          startTime = now;
          expiryTime = if (plan == #plan399) {
            ?(now + (2 * 30 * 24 * 60 * 60 * 1_000_000_000)); // 2 months in nanoseconds
          } else {
            null;
          };
        };
        subscriptions.add(caller, subscription);
      };
    };
  };

  public query ({ caller }) func getPlan() : async SubscriptionPlan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to get active plan");
    };

    switch (subscriptions.get(caller)) {
      case (?sub) { sub.plan };
      case (_) { #none };
    };
  };

  // Chat functions with subscription plan enforcement
  public shared ({ caller }) func startChat(participant2 : UserId) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Login required to start a chat");
    };

    // Verify participant2 is a valid user with permissions
    if (not (AccessControl.hasPermission(accessControlState, participant2, #user))) {
      Runtime.trap("Cannot start chat: Other user must be a registered user");
    };

    // Verify participant2 has a profile
    switch (profiles.get(participant2)) {
      case (null) {
        Runtime.trap("Cannot start chat: Other user has no profile");
      };
      case (_) {};
    };

    verifyNotBlocked(caller, participant2);

    // Only allow chat with distinct users
    if (caller == participant2) {
      Runtime.trap("Cannot chat with yourself");
    };

    // Check if chat already exists between these two users
    for ((chatId, chat) in chats.entries()) {
      if ((chat.participant1 == caller and chat.participant2 == participant2) or
          (chat.participant1 == participant2 and chat.participant2 == caller)) {
        return chatId;
      };
    };

    // Enforce paid plans for chat-volume limits
    let chatLimit = getPlanChatLimit(caller);
    let initiatedCount = switch (initiatedChats.get(caller)) {
      case (?count) { count };
      case (null) { 0 };
    };

    if (initiatedCount >= chatLimit) {
      Runtime.trap("Chat limit reached: You need to upgrade your subscription to connect with more people");
    };

    let chatId = nextChatId;
    nextChatId += 1;

    let newChat : Chat = {
      id = chatId;
      participant1 = caller;
      participant2;
      messages = [];
    };

    chats.add(chatId, newChat);
    initiatedChats.add(caller, initiatedCount + 1);
    chatId;
  };

  func getPlanChatLimit(userId : UserId) : Nat {
    switch (subscriptions.get(userId)) {
      case (?sub) {
        // Check expiry for ₹399 plan
        if (sub.plan == #plan399) {
          switch (sub.expiryTime) {
            case (?expiry) {
              if (Time.now() > expiry) {
                return 0;
              };
            };
            case (_) { return 0 };
          };
        };
        switch (sub.plan) {
          case (#plan98) { 2 };
          case (#plan199) { 7 };
          case (#plan399) { 7 };
          case (_) { 0 };
        };
      };
      case (null) { 0 };
    };
  };

  func hasActiveSubscription(userId : UserId) : Bool {
    getPlanChatLimit(userId) > 0;
  };

  public shared ({ caller }) func sendMessage(chatId : Nat, messageContent : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to send messages");
    };

    // Verify sender has an active subscription
    if (not hasActiveSubscription(caller)) {
      Runtime.trap("Chat limit reached: You need to upgrade your subscription to connect with more people");
    };

    switch (chats.get(chatId)) {
      case (?chat) {
        verifyChatParticipant(chat, caller);
        verifyNotBlocked(chat.participant1, chat.participant2);

        // Verify the other participant also has active subscription
        let otherParticipant = if (chat.participant1 == caller) {
          chat.participant2;
        } else {
          chat.participant1;
        };

        if (not hasActiveSubscription(otherParticipant)) {
          Runtime.trap("Cannot send message: Other user's subscription has expired");
        };

        let newMessage : ChatMessage = {
          sender = caller;
          content = messageContent;
          timestamp = Time.now();
        };

        let updatedMessages = chat.messages.concat([newMessage]);
        let updatedChat : Chat = {
          id = chat.id;
          participant1 = chat.participant1;
          participant2 = chat.participant2;
          messages = updatedMessages;
        };

        chats.add(chatId, updatedChat);
      };
      case (null) { Runtime.trap("Chat does not exist") };
    };
  };

  public query ({ caller }) func getChatHistory(chatId : Nat) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view chat history");
    };

    switch (chats.get(chatId)) {
      case (?chat) {
        verifyChatParticipant(chat, caller);
        chat.messages;
      };
      case (null) { Runtime.trap("Chat does not exist") };
    };
  };

  public query ({ caller }) func getUserChats() : async [Chat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view chats");
    };

    chats.values().toArray().filter(
      func(chat) {
        chat.participant1 == caller or chat.participant2 == caller;
      }
    );
  };

  // Blocking, reporting and moderation
  public shared ({ caller }) func blockUser(userToBlock : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage blocklist");
    };

    if (caller == userToBlock) {
      Runtime.trap("Cannot block yourself");
    };

    let blockedList = switch (blockedUsers.get(caller)) {
      case (?existing) { existing };
      case (null) { List.empty<UserId>() };
    };

    if (blockedList.any(func(user : UserId) : Bool { user == userToBlock })) {
      Runtime.trap("User is already blocked");
    };

    blockedList.add(userToBlock);
    blockedUsers.add(caller, blockedList);
  };

  public query ({ caller }) func isBlockedBy(blocked : UserId, blocker : UserId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check block status");
    };

    // Privacy protection: Users can only check if they are blocked by someone,
    // or if they have blocked someone. Cannot check arbitrary user relationships.
    if (caller != blocked and caller != blocker) {
      Runtime.trap("Unauthorized: Can only check your own block relationships");
    };

    isUserBlockedBy(blocker, blocked);
  };

  func isUserBlockedBy(blocker : UserId, blocked : UserId) : Bool {
    switch (blockedUsers.get(blocker)) {
      case (?blockedList) {
        blockedList.any(func(user : UserId) : Bool { user == blocked });
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func reportUser(reported : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can report others");
    };

    if (caller == reported) {
      Runtime.trap("Cannot report yourself");
    };

    let reports = switch (reportedUsers.get(reported)) {
      case (?existing) { existing };
      case (null) { 0 };
    };

    reportedUsers.add(reported, reports + 1);
  };

  // Admin function to view reports
  public query ({ caller }) func getReportedUsers() : async [(UserId, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view reports");
    };

    reportedUsers.entries().toArray();
  };

  // Admin function to view all subscriptions
  public query ({ caller }) func getAllSubscriptions() : async [(UserId, Subscription)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view subscriptions");
    };

    subscriptions.entries().toArray();
  };

  // Admin function to reset a user's chat initiation count
  public shared ({ caller }) func resetUserChatCount(user : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset chat counts");
    };

    initiatedChats.add(user, 0);
  };

  // Verification helpers
  func verifyChatParticipant(chat : Chat, participant : UserId) {
    if (chat.participant1 != participant and chat.participant2 != participant) {
      Runtime.trap("Unauthorized: Not a participant in this chat");
    };
  };

  func verifyNotBlocked(caller : UserId, participant2 : UserId) {
    if (isUserBlockedBy(caller, participant2) or isUserBlockedBy(participant2, caller)) {
      Runtime.trap("Cannot interact with blocked users");
    };
  };
};
