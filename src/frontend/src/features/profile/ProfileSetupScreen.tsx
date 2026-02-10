import { useState } from 'react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ProfilePhotoPicker } from './ProfilePhotoPicker';
import { Gender } from '../../backend';
import type { Image } from '../../backend';

export function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [interests, setInterests] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<Image | undefined>(undefined);
  const [gender, setGender] = useState<Gender | null>(null);
  const [connectWith, setConnectWith] = useState<Gender | null>(null);

  const saveMutation = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !city.trim()) {
      toast.error('Please fill in your name and city');
      return;
    }

    if (!gender) {
      toast.error('Please select your gender');
      return;
    }

    if (!connectWith) {
      toast.error('Please select who you want to connect with');
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
      toast.success('Profile created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create Your Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Tell us a bit about yourself to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Creating...' : 'Create Profile'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
