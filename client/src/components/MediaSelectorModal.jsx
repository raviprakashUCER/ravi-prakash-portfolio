import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { MediaLibraryTab } from './MediaLibraryTab';

export function MediaSelectorModal({ isOpen, onClose, onSelect, title = "Select Media File", authToken }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-[#090d16] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Library in Selector Mode */}
        <div className="flex-1 overflow-y-auto p-6">
          <MediaLibraryTab
            authToken={authToken}
            isSelectorMode={true}
            onSelectMedia={(file) => {
              onSelect(file);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
