import { useState } from 'react';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User, Edit, LogOut } from 'lucide-react';
import { ProfileEditForm } from './ProfileEditForm';
import { useQueryClient } from '@tanstack/react-query';
import { Gender } from '../../backend';
import { Pressable } from '../shared/motion/Pressable';

export function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  if (isEditing) {
    return <ProfileEditForm profile={profile} onCancel={() => setIsEditing(false)} />;
  }

  const photoUrl = profile.profilePhoto?.blob.getDirectURL();
  const genderLabel = profile.gender === Gender.male ? 'Male' : profile.gender === Gender.female ? 'Female' : 'Not set';
  const connectWithLabel = profile.connectWith === Gender.male ? 'Male' : profile.connectWith === Gender.female ? 'Female' : 'Not set';

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border bg-card/95 backdrop-blur-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
          <Pressable>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </Pressable>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-md space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-border bg-muted animate-breathing">
              {photoUrl ? (
                <img src={photoUrl} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.city}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">Gender</span>
              <span className="text-sm font-semibold text-foreground">{genderLabel}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">Looking for</span>
              <span className="text-sm font-semibold text-foreground">{connectWithLabel}</span>
            </div>
          </div>

          {profile.bio && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Bio</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {profile.interests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Pressable>
            <Button
              onClick={() => setIsEditing(true)}
              size="lg"
              variant="outline"
              className="w-full rounded-full"
            >
              <Edit className="mr-2 h-5 w-5" />
              Edit Profile
            </Button>
          </Pressable>
        </div>
      </div>
    </div>
  );
}
