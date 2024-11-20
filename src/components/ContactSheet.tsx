import React from 'react';
import { X } from 'lucide-react';
import { PhotoType } from '../types';

interface ContactSheetProps {
  photos: PhotoType[];
  onRemove: (index: number) => void;
}

const ContactSheet: React.FC<ContactSheetProps> = ({ photos, onRemove }) => {
  return (
    <div className="grid grid-cols-5 gap-6">
      {photos.map((photo, index) => (
        <div key={index} className="space-y-2">
          <div className="min-h-[1.5rem] px-1">
            <div className="text-sm font-medium text-blue-700 break-words">
              {photo.name}
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 rounded-lg border-2 border-blue-200" />
            <div className="aspect-[4/3] relative bg-gray-50">
              <img
                src={photo.url}
                alt={photo.name}
                className="rounded-lg absolute inset-0 w-full h-full object-cover"
              />
              <button
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactSheet;