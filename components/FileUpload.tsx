import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileLoaded: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded, setLoading, setError }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileLoaded(text);
        setLoading(false);
      };
      reader.onerror = () => {
        setError('La lecture du fichier a échoué.');
        setLoading(false);
      }
      reader.readAsText(file);
    }
  }, [onFileLoaded, setLoading, setError]);

  return (
    <div className="w-full max-w-lg mx-auto">
        <label htmlFor="file-upload" className="relative cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Cliquez pour charger</span> ou glissez-déposez</p>
                <p className="text-xs text-gray-500">Fichier iCalendar (.ics)</p>
            </div>
            <input id="file-upload" type="file" className="hidden" accept=".ics" onChange={handleFileChange} />
        </label>
    </div> 
  );
};

export default FileUpload;