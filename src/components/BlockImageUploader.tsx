import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  ExternalLink,
  Sliders,
  Check,
  Sparkles,
  Link,
  Layers,
} from 'lucide-react';

interface BlockImageUploaderProps {
  imageUrl?: string;
  onUpdateImage: (url: string) => void;
  overlayOpacity?: number;
  onUpdateOpacity: (val: number) => void;
  overlayColor?: string;
  onUpdateOverlayColor?: (color: string) => void;
  bgSize?: 'cover' | 'contain' | 'auto';
  onUpdateSize?: (size: 'cover' | 'contain' | 'auto') => void;
  bgPosition?: 'center' | 'top' | 'bottom';
  onUpdatePosition?: (pos: 'center' | 'top' | 'bottom') => void;
  textColor: 'dark' | 'light';
  onChangeTextColor: (textColor: 'dark' | 'light') => void;
}

const BG_IMAGE_PRESETS = [
  {
    label: 'Tech Workspace',
    category: 'Work',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Creative Studio',
    category: 'Design',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Modern Architecture',
    category: 'Structure',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Dark Gradient Mesh',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Minimalist Office',
    category: 'Interior',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Abstract Waves',
    category: 'Vibrant',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
  },
];

const OVERLAY_COLORS = [
  { label: 'Black', color: '#000000' },
  { label: 'Navy', color: '#0f172a' },
  { label: 'Primary', color: '#0d6efd' },
  { label: 'Indigo', color: '#1e1b4b' },
  { label: 'White', color: '#ffffff' },
];

export const BlockImageUploader: React.FC<BlockImageUploaderProps> = ({
  imageUrl = '',
  onUpdateImage,
  overlayOpacity = 50,
  onUpdateOpacity,
  overlayColor = '#000000',
  onUpdateOverlayColor,
  bgSize = 'cover',
  onUpdateSize,
  bgPosition = 'center',
  onUpdatePosition,
  textColor,
  onChangeTextColor,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDataUrl = imageUrl?.startsWith('data:');
  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);

  // Resize and compress image file to avoid exceeding localStorage quota
  const processImageFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) {
          setIsProcessing(false);
          return;
        }

        // Create HTMLImage to check dimensions and compress if needed
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1920;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            onUpdateImage(compressed);
          } else {
            onUpdateImage(result);
          }
          setIsProcessing(false);
        };
        img.onerror = () => {
          onUpdateImage(result);
          setIsProcessing(false);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    },
    [onUpdateImage]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
    // reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onUpdateImage(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleClearImage = () => {
    onUpdateImage('');
  };

  return (
    <div className="space-y-4">
      {/* Current Active Image Preview Card */}
      {hasImage ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              Active Background Image
            </span>
            <span className="text-[10px] text-slate-500 font-normal px-1.5 py-0.5 bg-slate-200 rounded">
              {isDataUrl ? 'Uploaded File' : 'External Web URL'}
            </span>
          </div>

          <div className="relative h-28 rounded-lg overflow-hidden border border-slate-300 shadow-inner group">
            <img
              src={imageUrl}
              alt="Background preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Overlay simulation */}
            <div
              className="absolute inset-0 transition-opacity"
              style={{
                backgroundColor: overlayColor,
                opacity: overlayOpacity / 100,
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Replace
              </button>
              <button
                type="button"
                onClick={handleClearImage}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              Upload different photo
            </button>
            <button
              type="button"
              onClick={handleClearImage}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition"
            >
              Clear Image
            </button>
          </div>
        </div>
      ) : null}

      {/* Mode Subtabs: Upload File vs Enter URL vs Presets */}
      <div className="space-y-3">
        <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1 ${
              activeTab === 'upload' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1 ${
              activeTab === 'url' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            Image URL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1 ${
              activeTab === 'presets' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Presets
          </button>
        </div>

        {/* Tab 1: Drag & Drop File Uploader */}
        {activeTab === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/70 scale-101'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                {isProcessing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <UploadCloud className="w-5 h-5" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-800">
                {isProcessing ? 'Optimizing Image...' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                PNG, JPG, WEBP, or SVG from your device
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: External Image URL */}
        {activeTab === 'url' && (
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyUrl();
                }}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition shrink-0"
              >
                Apply
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Paste any public web image address.
            </p>
          </div>
        )}

        {/* Tab 3: Curated Presets */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 gap-1.5">
            {BG_IMAGE_PRESETS.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  onUpdateImage(preset.url);
                  onChangeTextColor('light');
                }}
                className="group relative h-16 rounded-lg overflow-hidden border border-slate-200 text-left p-2 transition hover:scale-102 hover:shadow-xs"
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="relative z-10">
                  <span className="text-[9px] font-bold uppercase text-amber-300 tracking-wider block">
                    {preset.category}
                  </span>
                  <span className="text-[11px] font-semibold text-white truncate block">
                    {preset.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Image Controls (Overlay, Fit, Position) */}
      <div className="border-t border-slate-200 pt-3 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Overlay & Display Tuning
        </span>

        {/* Overlay Color & Opacity */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
            <span>Dark / Tint Overlay</span>
            <span>{overlayOpacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={overlayOpacity}
            onChange={(e) => onUpdateOpacity(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          {/* Quick Overlay Tint Swatches */}
          {onUpdateOverlayColor && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Overlay Color:</span>
              <div className="flex items-center gap-1.5">
                {OVERLAY_COLORS.map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    onClick={() => onUpdateOverlayColor(item.color)}
                    className={`w-4 h-4 rounded-full border border-slate-300 relative transition ${
                      overlayColor === item.color ? 'ring-2 ring-blue-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={item.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fit & Position Options */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Fit / Size */}
          {onUpdateSize && (
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Image Fit
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {(['cover', 'contain', 'auto'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onUpdateSize(mode)}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded capitalize transition ${
                      bgSize === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Position */}
          {onUpdatePosition && (
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Alignment
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {(['center', 'top', 'bottom'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => onUpdatePosition(pos)}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded capitalize transition ${
                      bgPosition === pos ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text Contrast Mode */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-700 block">Foreground Text</span>
            <span className="text-[10px] text-slate-400">Ensure high contrast against photo</span>
          </div>
          <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button
              type="button"
              onClick={() => onChangeTextColor('dark')}
              className={`px-2 py-1 text-[11px] font-semibold rounded transition ${
                textColor === 'dark' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Dark Text
            </button>
            <button
              type="button"
              onClick={() => onChangeTextColor('light')}
              className={`px-2 py-1 text-[11px] font-semibold rounded transition ${
                textColor === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Light Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
