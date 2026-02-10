import { UserCard } from './UserCard';
import type { Profile } from '../../backend';

interface DiscoveryListProps {
  profiles: Profile[];
  onSelectUser: (profile: Profile) => void;
}

export function DiscoveryList({ profiles, onSelectUser }: DiscoveryListProps) {
  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <UserCard
          key={profile.owner.toString()}
          profile={profile}
          onClick={() => onSelectUser(profile)}
        />
      ))}
    </div>
  );
}
