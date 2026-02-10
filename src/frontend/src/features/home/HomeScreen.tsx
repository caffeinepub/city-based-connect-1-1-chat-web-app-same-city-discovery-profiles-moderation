import { useState, useMemo, useEffect } from 'react';
import { useGetCallerUserProfile, useGetProfilesByCity } from '../../hooks/useQueries';
import { CityPickerSheet } from '../city/CityPickerSheet';
import { DiscoveryList } from './DiscoveryList';
import { UserPreviewSheet } from './UserPreviewSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, RefreshCw, Search, X } from 'lucide-react';
import { EmptyState } from '../shared/components/EmptyState';
import type { Profile } from '../../backend';

interface HomeScreenProps {
  onStartChat: (chatId: bigint) => void;
}

export function HomeScreen({ onStartChat }: HomeScreenProps) {
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-set city from user profile once loaded
  useEffect(() => {
    if (isFetched && userProfile?.city && !selectedCity) {
      setSelectedCity(userProfile.city);
    }
  }, [isFetched, userProfile?.city, selectedCity]);

  const { data: profiles = [], isLoading, refetch } = useGetProfilesByCity(selectedCity);

  // Filter profiles based on search query (case-insensitive)
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return profiles;
    }
    const query = searchQuery.toLowerCase().trim();
    return profiles.filter((profile) =>
      profile.name.toLowerCase().includes(query)
    );
  }, [profiles, searchQuery]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setShowCityPicker(false);
    setSearchQuery(''); // Clear search when changing city
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Check if user profile is missing required fields
  const hasIncompleteProfile = userProfile && (!userProfile.gender || !userProfile.connectWith);

  if (profileLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (hasIncompleteProfile) {
    return (
      <div className="flex h-full flex-col">
        <header className="border-b border-border bg-card px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">Discover</h1>
        </header>
        <div className="flex flex-1 items-center justify-center px-6">
          <EmptyState
            imageSrc="/assets/generated/empty-home.dim_1200x800.png"
            title="Complete Your Profile"
            description="Please update your profile with gender and connection preferences to start discovering people"
            action={
              <Button onClick={() => window.location.reload()} size="lg" className="rounded-full">
                Go to Profile
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (!selectedCity) {
    return (
      <div className="flex h-full flex-col">
        <header className="border-b border-border bg-card px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">Discover</h1>
        </header>
        <div className="flex flex-1 items-center justify-center px-6">
          <EmptyState
            imageSrc="/assets/generated/empty-home.dim_1200x800.png"
            title="Select Your City"
            description="Choose your city to discover people nearby"
            action={
              <Button onClick={() => setShowCityPicker(true)} size="lg" className="rounded-full">
                <MapPin className="mr-2 h-5 w-5" />
                Select City
              </Button>
            }
          />
        </div>
        <CityPickerSheet
          open={showCityPicker}
          onOpenChange={setShowCityPicker}
          onSelect={handleCityChange}
          currentCity={selectedCity}
        />
      </div>
    );
  }

  const showEmptySearch = searchQuery.trim() && filteredProfiles.length === 0 && profiles.length > 0;

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Discover</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="rounded-full"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <button
          onClick={() => setShowCityPicker(true)}
          className="mt-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <MapPin className="h-4 w-4" />
          {selectedCity}
        </button>
      </header>

      {/* Search input - only shown when city is selected */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 rounded-full"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : showEmptySearch ? (
          <div className="flex h-full items-center justify-center px-6">
            <EmptyState
              imageSrc="/assets/generated/empty-home.dim_1200x800.png"
              title="No Results Found"
              description={`No profiles matching "${searchQuery}" in ${selectedCity}. Try a different search term.`}
            />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <EmptyState
              imageSrc="/assets/generated/empty-home.dim_1200x800.png"
              title="No Matches Found"
              description="There are no matching people in your city with your connection preferences. Try selecting a different city or check back later."
            />
          </div>
        ) : (
          <DiscoveryList profiles={filteredProfiles} onSelectUser={setSelectedUser} />
        )}
      </div>

      <CityPickerSheet
        open={showCityPicker}
        onOpenChange={setShowCityPicker}
        onSelect={handleCityChange}
        currentCity={selectedCity}
      />

      {selectedUser && (
        <UserPreviewSheet
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
          onStartChat={onStartChat}
        />
      )}
    </div>
  );
}
