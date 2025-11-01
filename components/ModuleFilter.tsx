import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Filter } from 'lucide-react';

interface ModuleFilterProps {
  allModules: string[];
  selectedModules: string[];
  onSelectionChange: (selected: string[]) => void;
}

const ModuleFilter: React.FC<ModuleFilterProps> = ({ allModules, selectedModules, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);
  
  const handleToggle = (module: string) => {
    const currentIndex = selectedModules.indexOf(module);
    const newSelected = [...selectedModules];

    if (currentIndex === -1) {
      newSelected.push(module);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    onSelectionChange(newSelected);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors shadow-md"
      >
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <span>{`(${selectedModules.length}/${allModules.length})`}</span>
        </div>
        <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-30 top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden animate-fade-in-up">
          <div className="p-2 border-b border-gray-200 dark:border-gray-600 flex gap-2">
            <button
              onClick={() => onSelectionChange([...allModules].sort())}
              className="flex-1 px-3 py-1.5 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded-md flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Tout sélectionner
            </button>
            <button
              onClick={() => onSelectionChange([])}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-md flex items-center justify-center gap-2"
            >
              <X size={16} />
              Tout désélectionner
            </button>
          </div>
          <ul className="max-h-72 overflow-y-auto p-2">
            {allModules.map(module => (
              <li
                key={module}
                onClick={() => handleToggle(module)}
                className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={selectedModules.includes(module)}
                  className="h-4 w-4 rounded border-gray-400 dark:border-gray-500 bg-gray-200 dark:bg-gray-700 text-sky-500 focus:ring-sky-600 pointer-events-none"
                />
                <span className="ml-3 text-sm text-gray-800 dark:text-gray-300">{module}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ModuleFilter;