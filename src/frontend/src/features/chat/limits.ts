export function parseChatLimitError(errorMessage: string): string | null {
  if (errorMessage.includes('Chat limit reached')) {
    return 'Chat limit reached. Please upgrade your plan to connect with more people.';
  }
  return null;
}
