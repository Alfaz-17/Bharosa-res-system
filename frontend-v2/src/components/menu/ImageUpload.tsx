"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, X, Upload, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await api.post('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onChange(response.data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Item Image</label>
        {value && (
          <button 
            onClick={() => onChange("")}
            className="text-[10px] font-bold text-danger hover:underline uppercase tracking-wider"
          >
            Remove
          </button>
        )}
      </div>

      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {value ? (
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center p-6">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-brand animate-spin mx-auto mb-2" />
            ) : (
              <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            )}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {isUploading ? "Uploading..." : "Click to upload image"}
            </p>
            <p className="text-[10px] text-gray-300 mt-1">Recommended: 800x600px, Max 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
