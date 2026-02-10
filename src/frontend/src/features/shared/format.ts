export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatInterestsPreview(interests: string[], max: number = 3): string[] {
  if (interests.length <= max) return interests;
  return [...interests.slice(0, max), `+${interests.length - max}`];
}

// Generate a random distance for privacy (no exact location)
export function getRandomDistance(): string {
  const distances = ['< 1 km', '1-2 km', '2-5 km', '5-10 km', '10+ km'];
  return distances[Math.floor(Math.random() * distances.length)];
}
