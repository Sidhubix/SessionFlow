import React, { useState, useEffect } from 'react';
import { X, Save, Palette } from 'lucide-react';

interface ColorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (colors: { [key: string]: string }) => void;
  modules: string[];
  currentColors: { [key: string]: string };
}

const ColorSettingsModal: React.FC<ColorSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  modules,
  currentColors
}) => {
  const [colors, setColors] = useState(currentColors);

  useEffect(() => {
    if (isOpen) {
      setColors(currentColors);
    }
  }, [currentColors, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleColorChange = (module: string, color: string) => {
    setColors(prev => ({ ...prev, [module]: color }));
  };
  
  const handleSave = () => {
    onSave(colors);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-300 dark:border-gray-700 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2">
            <Palette size={22} />
            Personnaliser les Couleurs des Modules
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Choisissez une couleur de fond pour l'en-tête de chaque module dans le tableau de bord.</p>

        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {modules.map(module => (
            <li key={module} className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-900/50">
              <span className="text-sm text-gray-800 dark:text-gray-300 truncate pr-4">{module}</span>
              <input
                type="color"
                value={colors[module] || '#374151'} // Default to gray-700 if undefined
                onChange={(e) => handleColorChange(module, e.target.value)}
                className="w-10 h-10 bg-transparent border-none rounded-md cursor-pointer"
                aria-label={`Choisir la couleur pour ${module}`}
              />
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors flex items-center"
          >
            <Save size={18} className="mr-2"/>
            Sauvegarder les couleurs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorSettingsModal;