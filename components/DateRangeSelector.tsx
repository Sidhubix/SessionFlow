import React, { useState } from 'react';
import { ScheduleEntry } from '../types';

interface DateRangeSelectorProps {
  allEntries: ScheduleEntry[];
  onConfirm: (startDate: string, endDate: string) => void;
  onCancel: () => void;
  defaultStartDate: string;
  defaultEndDate: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ allEntries, onConfirm, onCancel, defaultStartDate, defaultEndDate }) => {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const handleConfirm = () => {
    onConfirm(startDate, endDate);
  };

  return (
    <div className="text-center p-8 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Sélectionner la Période à Analyser</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Votre fichier a été chargé avec succès. Veuillez définir la plage de dates que vous souhaitez afficher dans le tableau de bord.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
        <div className="w-full sm:w-auto">
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
            Date de début
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
            Date de fin
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
         <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors"
          >
            Annuler
          </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          Générer le tableau de bord
        </button>
      </div>
    </div>
  );
};

export default DateRangeSelector;