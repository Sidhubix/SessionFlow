import React, { useState, useEffect } from 'react';
import { X, Save, Palette, Database } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
type SortOrder = 'date' | 'code';
type ActiveTab = 'appearance' | 'data';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { width: number; tooltipDelay: number; startDate: string; endDate: string; sortOrder: SortOrder, theme: Theme, classTypeColors: { apprentice: string, initial: string }, pastDateColors: { light: string, dark: string } }) => void;
  currentWidth: number;
  currentTooltipDelay: number;
  currentDefaultStartDate: string;
  currentDefaultEndDate: string;
  currentSortOrder: SortOrder;
  currentTheme: Theme;
  currentClassTypeColors: { apprentice: string, initial: string };
  currentPastDateColors: { light: string, dark: string };
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentWidth, 
  currentTooltipDelay,
  currentDefaultStartDate,
  currentDefaultEndDate,
  currentSortOrder,
  currentTheme,
  currentClassTypeColors,
  currentPastDateColors
}) => {
  const [width, setWidth] = useState(currentWidth);
  const [delay, setDelay] = useState(currentTooltipDelay);
  const [startDate, setStartDate] = useState(currentDefaultStartDate);
  const [endDate, setEndDate] = useState(currentDefaultEndDate);
  const [sortOrder, setSortOrder] = useState(currentSortOrder);
  const [theme, setTheme] = useState(currentTheme);
  const [classTypeColors, setClassTypeColors] = useState(currentClassTypeColors);
  const [pastDateColors, setPastDateColors] = useState(currentPastDateColors);
  const [activeTab, setActiveTab] = useState<ActiveTab>('appearance');

  useEffect(() => {
    if (isOpen) {
        setWidth(currentWidth);
        setDelay(currentTooltipDelay);
        setStartDate(currentDefaultStartDate);
        setEndDate(currentDefaultEndDate);
        setSortOrder(currentSortOrder);
        setTheme(currentTheme);
        setClassTypeColors(currentClassTypeColors);
        setPastDateColors(currentPastDateColors);
        setActiveTab('appearance'); // Reset to first tab on open
    }
  }, [isOpen, currentWidth, currentTooltipDelay, currentDefaultStartDate, currentDefaultEndDate, currentSortOrder, currentTheme, currentClassTypeColors, currentPastDateColors]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave({ width, tooltipDelay: delay, startDate, endDate, sortOrder, theme, classTypeColors, pastDateColors });
    onClose();
  };

  const TabButton: React.FC<{tabId: ActiveTab, currentTab: ActiveTab, onClick: (tabId: ActiveTab) => void, children: React.ReactNode}> = ({ tabId, currentTab, onClick, children }) => {
    const isActive = tabId === currentTab;
    return (
      <button
        onClick={() => onClick(tabId)}
        className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
          isActive
            ? 'border-sky-500 text-sky-600 dark:text-sky-400'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
        }`}
        role="tab"
        aria-selected={isActive}
      >
        {children}
      </button>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-300 dark:border-gray-700 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400">Paramètres</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
             <TabButton tabId="appearance" currentTab={activeTab} onClick={setActiveTab}>
              <Palette size={16} /> Apparence
            </TabButton>
            <TabButton tabId="data" currentTab={activeTab} onClick={setActiveTab}>
              <Database size={16} /> Données
            </TabButton>
          </nav>
        </div>

        <div className="space-y-6 min-h-[580px]">
          {activeTab === 'appearance' && (
            <>
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thème de l'interface</label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="system">Système</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Adaptez l'apparence à vos préférences.</p>
              </div>
              <div>
                <label htmlFor="table-width" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Largeur du tableau (%)</label>
                <input
                  type="number"
                  id="table-width"
                  value={width}
                  onChange={(e) => setWidth(Math.max(10, Math.min(100, Number(e.target.value))))}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  min="10"
                  max="100"
                />
                 <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Pourcentage de la largeur de la page.</p>
              </div>
              <div>
                <label htmlFor="tooltip-delay" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Délai de l'info-bulle (ms)</label>
                <input
                  type="number"
                  id="tooltip-delay"
                  value={delay}
                  onChange={(e) => setDelay(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  min="0"
                  step="50"
                />
                 <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Temps avant l'apparition de l'info-bulle.</p>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur mention (Apprentis)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={classTypeColors.apprentice}
                    onChange={(e) => setClassTypeColors(c => ({...c, apprentice: e.target.value}))}
                    className="w-10 h-10 p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={classTypeColors.apprentice}
                    onChange={(e) => setClassTypeColors(c => ({...c, apprentice: e.target.value}))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="#ef4444"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur mention (Initiaux)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={classTypeColors.initial}
                    onChange={(e) => setClassTypeColors(c => ({...c, initial: e.target.value}))}
                    className="w-10 h-10 p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={classTypeColors.initial}
                    onChange={(e) => setClassTypeColors(c => ({...c, initial: e.target.value}))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="#0ea5e9"
                  />
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur dates passées (Thème clair)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={pastDateColors.light}
                    onChange={(e) => setPastDateColors(c => ({...c, light: e.target.value}))}
                    className="w-10 h-10 p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={pastDateColors.light}
                    onChange={(e) => setPastDateColors(c => ({...c, light: e.target.value}))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="#e5e7eb"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur dates passées (Thème sombre)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={pastDateColors.dark}
                    onChange={(e) => setPastDateColors(c => ({...c, dark: e.target.value}))}
                    className="w-10 h-10 p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={pastDateColors.dark}
                    onChange={(e) => setPastDateColors(c => ({...c, dark: e.target.value}))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="#111827"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'data' && (
             <>
                <div>
                  <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trier les modules par</label>
                  <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'date' | 'code')}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="date">Date de première séance</option>
                    <option value="code">Code du module</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Ordre d'affichage des modules dans le tableau.</p>
                </div>
                <div>
                  <label htmlFor="default-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début par défaut</label>
                  <input
                    type="date"
                    id="default-start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Date de début de l'année scolaire.</p>
                </div>
                <div>
                  <label htmlFor="default-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin par défaut</label>
                  <input
                    type="date"
                    id="default-end-date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Date de fin de l'année scolaire.</p>
                </div>
             </>
          )}
        </div>

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
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;