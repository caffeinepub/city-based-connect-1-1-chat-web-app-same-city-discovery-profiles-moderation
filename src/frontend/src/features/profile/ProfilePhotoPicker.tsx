import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';
import type { Image } from '../../backend';

interface ProfilePhotoPickerProps {
  value?: Image;
  onChange: (image: Image | undefined) => void;
}

export function ProfilePhotoPicker({ value, onChange }: ProfilePhotoPickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    value ? value.blob.getDirectURL() : null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create ExternalBlob
      const blob = ExternalBlob.fromBytes(uint8Array);

      // Create preview URL
      const url = blob.getDirectURL();
      setPreviewUrl(url);

      // Create Image object
      const image: Image = {
        blob,
        name: file.name,
        fileType: file.type,
      };

      onChange(image);
      toast.success('Photo selected');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {previewUrl ? (
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-border bg-muted">
            <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-0 top-0 rounded-full bg-destructive p-1 text-destructive-foreground shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-border bg-muted">
            <Camera className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="rounded-full"
      >
        {uploading ? 'Processing...' : previewUrl ? 'Change Photo' : 'Add Photo'}
      </Button>
    </div>
  );
}
