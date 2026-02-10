import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type ChatId = bigint;
export interface Profile {
    bio: string;
    owner: UserId;
    interests: Array<string>;
    city: City;
    name: string;
    profilePhoto?: Image;
    connectWith?: Gender;
    gender?: Gender;
}
export type City = string;
export interface Subscription {
    startTime: bigint;
    plan: SubscriptionPlan;
    expiryTime?: bigint;
}
export interface UserProfileUpdate {
    bio: string;
    interests: Array<string>;
    city: City;
    name: string;
    profilePhoto?: Image;
    connectWith: Gender;
    gender: Gender;
}
export type UserId = Principal;
export interface Chat {
    id: ChatId;
    participant1: UserId;
    participant2: UserId;
    messages: Array<ChatMessage>;
}
export interface Image {
    blob: ExternalBlob;
    name: string;
    fileType: string;
}
export interface ChatMessage {
    content: string;
    sender: UserId;
    timestamp: bigint;
}
export enum Gender {
    female = "female",
    male = "male"
}
export enum SubscriptionPlan {
    plan98 = "plan98",
    none = "none",
    plan199 = "plan199",
    plan399 = "plan399"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activatePlan(plan: SubscriptionPlan): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(userToBlock: UserId): Promise<void>;
    createOrUpdateProfile(update: UserProfileUpdate): Promise<void>;
    getAllSubscriptions(): Promise<Array<[UserId, Subscription]>>;
    getAllUserProfiles(): Promise<Array<Profile>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatHistory(chatId: bigint): Promise<Array<ChatMessage>>;
    getOwnProfile(): Promise<Profile>;
    getPlan(): Promise<SubscriptionPlan>;
    getProfilesByCity(city: City): Promise<Array<Profile>>;
    getReportedUsers(): Promise<Array<[UserId, bigint]>>;
    getUserChats(): Promise<Array<Chat>>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isBlockedBy(blocked: UserId, blocker: UserId): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    reportUser(reported: UserId): Promise<void>;
    resetUserChatCount(user: UserId): Promise<void>;
    saveCallerUserProfile(profile: UserProfileUpdate): Promise<void>;
    sendMessage(chatId: bigint, messageContent: string): Promise<void>;
    startChat(participant2: UserId): Promise<bigint>;
}
