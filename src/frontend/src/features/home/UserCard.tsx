import { User } from 'lucide-react';
import type { Profile } from '../../backend';
import { formatInterestsPreview, getRandomDistance } from '../shared/format';
import { LiftCard } from '../shared/motion/LiftCard';

interface UserCardProps {
  profile: Profile;
  onClick: () => void;
}

export function UserCard({ profile, onClick }: UserCardProps) {
  const photoUrl = profile.profilePhoto?.blob.getDirectURL();
  const distance = getRandomDistance();

  return (
    <LiftCard
      onClick={onClick}
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={profile.name}
            className="h-full w-full object-cover transition-transform hover:scale-105 animate-avatar-entrance"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center animate-avatar-entrance">
            <User className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 rounded-full bg-background/90 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
          {distance}
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div>
          <h3 className="font-semibold text-foreground">{profile.name}</h3>
          <p className="text-sm text-muted-foreground">{profile.city}</p>
        </div>

        {profile.bio && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>
        )}

        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formatInterestsPreview(profile.interests).map((interest, i) => (
              <span
                key={i}
                className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </LiftCard>
  );
}
