'use client';

import { cn } from '@/lib/utils';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Drag & Drop dosya yükleme alanı.
 * WhatsApp .txt export dosyası için.
 */
export function DropZone({ onFileSelect, isLoading, error }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.txt')) {
          setSelectedFile(file);
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="w-full max-w-md">
      <motion.label
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex flex-col items-center justify-center w-full h-48',
          'border-2 border-dashed rounded-2xl cursor-pointer',
          'transition-all duration-200',
          isDragging
            ? 'border-[#25D366] bg-[#25D366]/10'
            : 'border-[#2A3942] bg-[#202C33]/50 hover:border-[#3B4A54]',
          isLoading && 'pointer-events-none opacity-50'
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".txt"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-2"
            >
              <FileText className="w-12 h-12 text-[#25D366]" />
              <span className="text-[#E9EDEF] font-medium">
                {selectedFile.name}
              </span>
              <span className="text-[#8696A0] text-sm">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <Upload
                className={cn(
                  'w-12 h-12 transition-colors',
                  isDragging ? 'text-[#25D366]' : 'text-[#8696A0]'
                )}
              />
              <div className="text-center">
                <p className="text-[#E9EDEF] font-medium">
                  WhatsApp export dosyanı sürükle
                </p>
                <p className="text-[#8696A0] text-sm mt-1">
                  veya tıkla ve seç (.txt)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.label>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mt-3 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}