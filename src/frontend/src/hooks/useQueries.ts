import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Profile, UserProfileUpdate, Chat, ChatMessage, City, SubscriptionPlan } from '../backend';
import { Principal } from '@dfinity/principal';

// Profile queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Profile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfileUpdate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Profile | null>({
    queryKey: ['userProfile', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

// Discovery queries
export function useGetProfilesByCity(city: City | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Profile[]>({
    queryKey: ['profilesByCity', city],
    queryFn: async () => {
      if (!actor || !city) return [];
      return actor.getProfilesByCity(city);
    },
    enabled: !!actor && !actorFetching && !!city,
  });
}

// Chat queries
export function useGetUserChats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Chat[]>({
    queryKey: ['userChats'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserChats();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

export function useGetChatHistory(chatId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['chatHistory', chatId?.toString()],
    queryFn: async () => {
      if (!actor || chatId === null) return [];
      return actor.getChatHistory(chatId);
    },
    enabled: !!actor && !actorFetching && chatId !== null,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });
}

export function useStartChat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participant2: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.startChat(participant2);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, content }: { chatId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(chatId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', variables.chatId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

// Subscription queries
export function useGetPlan() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SubscriptionPlan>({
    queryKey: ['currentPlan'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPlan();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useActivatePlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      if (!actor) throw new Error('Actor not available');
      return actor.activatePlan(plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPlan'] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

// Moderation queries
export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.blockUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profilesByCity'] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

export function useReportUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reportUser(userId);
    },
  });
}

export function useIsBlockedBy() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ blocked, blocker }: { blocked: Principal; blocker: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.isBlockedBy(blocked, blocker);
    },
  });
}
