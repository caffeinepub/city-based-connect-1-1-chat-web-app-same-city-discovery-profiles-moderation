import { useState } from 'react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ProfilePhotoPicker } from './ProfilePhotoPicker';
import { Gender } from '../../backend';
import type { Profile, Image } from '../../backend';

interface ProfileEditFormProps {
  profile: Profile;
  onCancel: () => void;
}

export function ProfileEditForm({ profile, onCancel }: ProfileEditFormProps) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [city, setCity] = useState(profile.city);
  const [interests, setInterests] = useState(profile.interests.join(', '));
  const [profilePhoto, setProfilePhoto] = useState<Image | undefined>(profile.profilePhoto);
  const [gender, setGender] = useState<Gender>(profile.gender || Gender.male);
  const [connectWith, setConnectWith] = useState<Gender>(profile.connectWith || Gender.female);

  const saveMutation = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !city.trim()) {
      toast.error('Please fill in your name and city');
      return;
    }

    try {
      await saveMutation.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
        city: city.trim(),
        interests: interests
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
        profilePhoto,
        gender,
        connectWith,
      });
      toast.success('Profile updated successfully!');
      onCancel();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Edit Profile</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
          <ProfilePhotoPicker value={profilePhoto} onChange={setProfilePhoto} />

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Gender *</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender(Gender.male)}
                className={`flex-1 rounded-full border-2 px-6 py-3 text-sm font-medium transition-colors ${
                  gender === Gender.male
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender(Gender.female)}
                className={`flex-1 rounded-full border-2 px-6 py-3 text-sm font-medium transition-colors ${
                  gender === Gender.female
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>I want to connect with *</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConnectWith(Gender.male)}
                className={`flex-1 rounded-full border-2 px-6 py-3 text-sm font-medium transition-colors ${
                  connectWith === Gender.male
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setConnectWith(Gender.female)}
                className={`flex-1 rounded-full border-2 px-6 py-3 text-sm font-medium transition-colors ${
                  connectWith === Gender.female
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., San Francisco"
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Interests</Label>
            <Input
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g., hiking, coffee, music"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">Separate with commas</p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="flex-1 rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 rounded-full"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
