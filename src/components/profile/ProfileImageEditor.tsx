'use client';
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/canvasUtils';

interface ProfileImageEditorProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (imageBlob: Blob) => void;
}

export function ProfileImageEditor({ isOpen, onOpenChange, onSave }: ProfileImageEditorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
    }
  };

  const handleSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) {
        onSave(croppedImageBlob);
        resetState();
      }
    }
  };

  const resetState = () => {
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload, crop, and adjust your new profile picture.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!imageSrc ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
                id="profile-image-upload"
              />
              <label htmlFor="profile-image-upload">
                <Button asChild>
                  <span>Choose Image</span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG up to 5MB</p>
            </div>
          ) : (
            <>
              <div className="relative h-64 w-full">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Zoom</label>
                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={(val) => setZoom(val[0])}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetState}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!imageSrc}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
