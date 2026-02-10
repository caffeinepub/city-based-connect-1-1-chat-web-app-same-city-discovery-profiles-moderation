import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { Pressable } from '../shared/motion/Pressable';
import { PressableRow } from '../shared/motion/PressableRow';

interface CityPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (city: string) => void;
  currentCity: string | null;
}

const POPULAR_CITIES = [
  'San Francisco',
  'New York',
  'Los Angeles',
  'Chicago',
  'Austin',
  'Seattle',
  'Boston',
  'Miami',
  'Denver',
  'Portland',
];

export function CityPickerSheet({ open, onOpenChange, onSelect, currentCity }: CityPickerSheetProps) {
  const [customCity, setCustomCity] = useState('');

  const handleSelectCity = (city: string) => {
    onSelect(city);
    setCustomCity('');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCity.trim()) {
      handleSelectCity(customCity.trim());
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Select Your City</SheetTitle>
          <SheetDescription>Choose where you want to discover people</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto pb-6">
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <Label htmlFor="custom-city">Enter City</Label>
            <div className="flex gap-2">
              <Input
                id="custom-city"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="Type your city..."
                className="flex-1"
              />
              <Pressable>
                <Button type="submit" disabled={!customCity.trim()} className="rounded-full">
                  Select
                </Button>
              </Pressable>
            </div>
          </form>

          <div className="space-y-3">
            <Label>Popular Cities</Label>
            <div className="grid gap-2">
              {POPULAR_CITIES.map((city) => (
                <PressableRow
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    currentCity === city
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card'
                  }`}
                >
                  <MapPin className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{city}</span>
                </PressableRow>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
