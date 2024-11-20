import React, { useState, useCallback, useRef } from 'react';
import { ImagePlus, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import heic2any from 'heic2any';
import ContactSheet from './components/ContactSheet';
import { PhotoType } from './types';

function App() {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const contactSheetRef = useRef<HTMLDivElement>(null);

  const processFile = async (file: File) => {
    try {
      let imageBlob = file;
      
      // Convert HEIC to JPEG if needed
      if (file.type === 'image/heic' || file.type === 'image/heif') {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        });
        imageBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      }

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      if (file.type.startsWith('image/') || file.type === 'image/heic' || file.type === 'image/heif') {
        try {
          const dataUrl = await processFile(file);
          setPhotos(prev => [...prev, {
            name: file.name,
            url: dataUrl
          }]);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
        }
      }
    }
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      if (file.type.startsWith('image/') || file.type === 'image/heic' || file.type === 'image/heif') {
        try {
          const dataUrl = await processFile(file);
          setPhotos(prev => [...prev, {
            name: file.name,
            url: dataUrl
          }]);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
        }
      }
    }
  }, []);

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const downloadContactSheet = async () => {
    if (!contactSheetRef.current) return;

    try {
      const buttons = contactSheetRef.current.querySelectorAll('button');
      buttons.forEach(button => button.style.display = 'none');

      const canvas = await html2canvas(contactSheetRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      buttons.forEach(button => button.style.display = '');

      const link = document.createElement('a');
      link.download = 'contact-sheet.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating contact sheet:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Sheet Generator</h1>
          <p className="text-gray-600">Drag and drop your photos or click to select files</p>
        </div>

        <div
          className="bg-white rounded-lg shadow-sm p-4 mb-6"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*,.heic,.heif"
              className="hidden"
              id="file-input"
              onChange={handleFileInput}
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <ImagePlus className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-gray-600">Drop photos here or click to select</span>
            </label>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Contact Sheet</h2>
              <button
                onClick={downloadContactSheet}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </button>
            </div>
            
            <div ref={contactSheetRef} className="bg-white rounded p-6">
              <ContactSheet photos={photos} onRemove={removePhoto} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;