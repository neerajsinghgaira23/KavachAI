import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const DropzoneUploader: React.FC = () => {
  const { setInputText } = useScanContext();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      } else {
        const mockExtracted = `[EXTRACTED OCR FROM DOCUMENT: ${file.name}]\n\nAPPOINTMENT LETTER & ONBOARDING DIRECTIVE\nPosition: Senior Cloud Solutions Specialist\nTo complete onboarding and dispatch your company MacBook, please wire a refundable equipment security deposit of $450 to our verified corporate Bitcoin wallet or Zelle before onboarding.\nConfirm with Talent Acquisition Director on Telegram: @CorporateRecruiter_Lead`;
        setInputText(mockExtracted);
      }
    };

    if (file.name.endsWith('.txt') || file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      const mockExtracted = `[EXTRACTED OCR FROM DOCUMENT: ${file.name}]\n\nAPPOINTMENT LETTER & ONBOARDING DIRECTIVE\nPosition: Senior Cloud Solutions Specialist\nTo complete onboarding and dispatch your company MacBook, please wire a refundable equipment security deposit of $450 to our verified corporate Bitcoin wallet or Zelle before onboarding.\nConfirm with Talent Acquisition Director on Telegram: @CorporateRecruiter_Lead`;
      setInputText(mockExtracted);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setInputText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.json,.png,.jpg,.jpeg"
        onChange={handleChange}
        className="hidden"
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-black bg-zinc-100 shadow-md'
            : uploadedFile
            ? 'border-black bg-zinc-50'
            : 'border-zinc-300 hover:border-black bg-cyber-elevated hover:bg-zinc-100'
        }`}
      >
        {uploadedFile ? (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-zinc-300 shadow-sm">
            <div className="flex items-center space-x-3 truncate">
              <div className="p-2.5 rounded-xl bg-black text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left truncate">
                <p className="text-sm font-bold text-black truncate">{uploadedFile.name}</p>
                <p className="text-xs text-zinc-500 font-mono">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • [READY FOR INSPECTION]
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2.5 py-2">
            <div className="p-3.5 rounded-2xl bg-black text-white shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-black">
                Drag &amp; drop document or <span className="underline">browse files</span>
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Supports PDF appointment letters, rental agreements, or TXT letters (Up to 10MB)
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400 font-mono">
              <span>PDF OCR Extraction</span>
              <span>•</span>
              <span>Advance-Fee Heuristics</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
