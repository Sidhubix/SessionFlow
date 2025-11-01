import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { ScheduleEntry, GroupedByModule } from './types';
import { parseICSContent } from './services/parser';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import ColorSettingsModal from './components/ColorSettingsModal';
import DateRangeSelector from './components/DateRangeSelector';
import ModuleFilter from './components/ModuleFilter';
import Tooltip from './components/Tooltip';
import LegalModal from './components/LegalModal';

// FIX: Changed interface to a type intersection to correctly inherit SVG props like className.
type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};
type Theme = 'light' | 'dark' | 'system';

declare const html2canvas: any;
declare global {
  interface Window {
    jspdf: any;
  }
}

const LucideIcons = {
  Loader: ({ size = 24, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  UploadCloud: ({ size = 24, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
        <path d="M12 12v9"/>
        <path d="m16 16-4-4-4 4"/>
    </svg>
  ),
  Settings: ({ size = 24, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0 2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Palette: ({ size = 24, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.667 0-.424-.172-.82-.48-1.106-.308-.286-.744-.465-1.218-.465H12c-.55 0-1-.45-1-1v-1c0-.55.45-1 1-1h.5c.55 0 1-.45 1-1v-1c0-.55.45-1 1-1h.5c.55 0 1-.45 1-1v-1c0-.55.45-1 1-1H17c.55 0 1-.45 1-1v-1c0-.55.45-1 1-1h.5c.55 0 1-.45 1-1v-1c0-.55.45-1 1-1H21c.55 0 1-.45 1-1v-.5c0-1.5-1.5-2.5-3-2.5H12z"/>
    </svg>
  ),
  CalendarClock: ({ size = 24, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/>
        <path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/>
        <path d="M17.5 17.5 16 16.25V14"/><circle cx="16" cy="16" r="6"/>
    </svg>
  ),
  RefreshCw: ({ size = 24, ...props }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M3 12a9 9 0 0 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
    </svg>
  ),
  FileUp: ({ size = 24, ...props }: IconProps) => ( // Import
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/>
    </svg>
  ),
  FileDown: ({ size = 24, ...props }: IconProps) => ( // Export
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m15 15-3 3-3-3"/>
    </svg>
  ),
  FileText: ({ size = 24, ...props }: IconProps) => ( // PDF Export
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
    </svg>
  ),
  FileCode: ({ size = 24, ...props }: IconProps) => ( // Markdown Export
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>
    </svg>
  ),
};

const getSchoolYearBounds = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  let startYear = today.getFullYear();
  if (currentMonth < 7) { 
    startYear = today.getFullYear() - 1;
  }
  const endYear = startYear + 1;

  const lastDayOfAugust = new Date(startYear, 8, 0);
  const dayOfWeekAug = lastDayOfAugust.getDay();
  const diffAug = (dayOfWeekAug === 0 ? 6 : dayOfWeekAug - 1);
  const lastMondayOfAugust = new Date(lastDayOfAugust);
  lastMondayOfAugust.setDate(lastDayOfAugust.getDate() - diffAug);
  
  const lastDayOfJuly = new Date(endYear, 7, 0);
  const dayOfWeekJul = lastDayOfJuly.getDay();
  const diffJul = (dayOfWeekJul < 5) ? (dayOfWeekJul + 2) : (dayOfWeekJul - 5);
  const lastFridayOfJuly = new Date(lastDayOfJuly);
  lastFridayOfJuly.setDate(lastDayOfJuly.getDate() - diffJul);
  
  const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

  return {
    defaultStartDate: formatDateForInput(lastMondayOfAugust),
    defaultEndDate: formatDateForInput(lastFridayOfJuly),
  };
};

const { Loader, Settings, Palette, RefreshCw, FileUp, FileDown, FileText, CalendarClock, FileCode } = LucideIcons;

type AppStep = 'upload' | 'date-select' | 'dashboard';
type SortOrder = 'date' | 'code';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('upload');
  const [allScheduleData, setAllScheduleData] = useState<ScheduleEntry[]>([]);
  const [scheduleDataForPeriod, setScheduleDataForPeriod] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingMarkdown, setIsExportingMarkdown] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [tableWidth, setTableWidth] = useState(100);
  const [tooltipDelay, setTooltipDelay] = useState(200);
  const [sortOrder, setSortOrder] = useState<SortOrder>('date');
  const [moduleColors, setModuleColors] = useState<{ [key: string]: string }>({});
  const [classTypeColors, setClassTypeColors] = useState({ apprentice: '#ef4444', initial: '#0ea5e9' });
  const [pastDateColors, setPastDateColors] = useState({ light: '#e5e7eb', dark: '#111827' });
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollToDate, setScrollToDate] = useState<string | null>(null);

  const { defaultStartDate: initialStartDate, defaultEndDate: initialEndDate } = getSchoolYearBounds();
  const [defaultStartDate, setDefaultStartDate] = useState(initialStartDate);
  const [defaultEndDate, setDefaultEndDate] = useState(initialEndDate);
  
  // State for the module filter
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const root = window.document.documentElement;
    
    const checkDarkMode = () => {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      let newIsDark = false;
      if (theme === 'system') {
        newIsDark = systemPrefersDark;
      } else {
        newIsDark = theme === 'dark';
      }
      root.classList.toggle('dark', newIsDark);
      setIsDarkMode(newIsDark);
    };
  
    checkDarkMode();
  
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // Only listen for system changes if the theme is 'system'
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        checkDarkMode();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);


  const generateColorFromString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 50%, 25%)`;
  };

  const handleFileLoaded = (content: string, file?: File) => {
    try {
      if (file) setFileName(file.name);
      const parsedData = parseICSContent(content);
      if (parsedData.length === 0) {
        setError("Le fichier .ics semble être vide ou ne contient aucun événement pertinent.");
      } else {
        setAllScheduleData(parsedData);
        setStep('date-select');
        setError(null);
      }
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue lors du traitement du fichier .ics.");
      console.error(e);
    }
  };

  const handleDateRangeSelected = (startDateStr: string, endDateStr: string) => {
    const startDate = new Date(startDateStr + 'T00:00:00.000Z');
    const endDate = new Date(endDateStr + 'T23:59:59.999Z');

    const filteredData = allScheduleData.filter(entry => {
        const entryDate = entry.startDate;
        return entryDate >= startDate && entryDate <= endDate;
    });

    if(filteredData.length === 0) {
      setError("Aucune séance trouvée dans la période sélectionnée. Veuillez essayer une autre plage de dates.");
      setStep('date-select');
    } else {
      setScheduleDataForPeriod(filteredData);
      
      const uniqueModules = Array.from(new Set(filteredData.map(entry => `${entry.moduleCode} (${entry.classType})`))).sort();
      setAvailableModules(uniqueModules);
      setSelectedModules(uniqueModules); // Select all by default

      setModuleColors(prevColors => {
          const newColors = { ...prevColors };
          uniqueModules.forEach((mod: string) => {
              if (!newColors[mod]) {
                  newColors[mod] = generateColorFromString(mod);
              }
          });
          return newColors;
      });

      setStep('dashboard');
      setError(null);
    }
  };
  
  const handleGoToToday = () => {
    const todayKey = new Date().toISOString().split('T')[0];
    setScrollToDate(todayKey);
  };

  const dashboardData = useMemo(() => {
    if (!scheduleDataForPeriod.length || !selectedModules.length) return [];
    const selectedSet = new Set(selectedModules);
    return scheduleDataForPeriod.filter(entry => selectedSet.has(`${entry.moduleCode} (${entry.classType})`));
  }, [scheduleDataForPeriod, selectedModules]);
  
  const handleReset = () => {
    setStep('upload');
    setAllScheduleData([]);
    setScheduleDataForPeriod([]);
    setFileName('');
    setError(null);
    setAvailableModules([]);
    setSelectedModules([]);
  }

  const handleSaveSettings = (settings: { width: number; tooltipDelay: number; startDate: string; endDate: string; sortOrder: SortOrder; theme: Theme; classTypeColors: { apprentice: string, initial: string }; pastDateColors: { light: string; dark: string; }; }) => {
    setTableWidth(settings.width);
    setTooltipDelay(settings.tooltipDelay);
    setDefaultStartDate(settings.startDate);
    setDefaultEndDate(settings.endDate);
    setSortOrder(settings.sortOrder);
    setTheme(settings.theme);
    setClassTypeColors(settings.classTypeColors);
    setPastDateColors(settings.pastDateColors);
    localStorage.setItem('theme', settings.theme);
  };
  
  const handleSaveColors = (newColors: { [key: string]: string }) => {
    setModuleColors(newColors);
  };

  const handleExport = () => {
    const stateToSave = {
      allScheduleData,
      tableWidth,
      tooltipDelay,
      sortOrder,
      moduleColors,
      classTypeColors,
      pastDateColors,
      theme,
      defaultStartDate,
      defaultEndDate,
      availableModules,
      selectedModules,
      fileName,
    };
    const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tdb-iut-sauvegarde.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const savedState = JSON.parse(text);

        if (!savedState.allScheduleData || !savedState.moduleColors) {
          throw new Error("Fichier de sauvegarde invalide ou corrompu.");
        }
        
        // Rehydrate string dates back to Date objects
        const rehydratedData = savedState.allScheduleData.map((entry: any) => ({
          ...entry,
          startDate: new Date(entry.startDate),
        }));

        setAllScheduleData(rehydratedData);
        setTableWidth(savedState.tableWidth || 100);
        setTooltipDelay(savedState.tooltipDelay || 200);
        setSortOrder(savedState.sortOrder || 'date');
        setModuleColors(savedState.moduleColors || {});
        setClassTypeColors(savedState.classTypeColors || { apprentice: '#ef4444', initial: '#0ea5e9' });
        setPastDateColors(savedState.pastDateColors || { light: '#e5e7eb', dark: '#111827' });
        setTheme(savedState.theme || 'light');
        setDefaultStartDate(savedState.defaultStartDate || initialStartDate);
        setDefaultEndDate(savedState.defaultEndDate || initialEndDate);
        setAvailableModules(savedState.availableModules || []);
        setSelectedModules(savedState.selectedModules || []);
        setFileName(savedState.fileName || file.name);

        // Filter data for the dashboard based on imported date range
        const startDate = new Date((savedState.defaultStartDate || initialStartDate) + 'T00:00:00.000Z');
        const endDate = new Date((savedState.defaultEndDate || initialEndDate) + 'T23:59:59.999Z');
        const filteredData = rehydratedData.filter((entry: ScheduleEntry) => {
            const entryDate = entry.startDate;
            return entryDate >= startDate && entryDate <= endDate;
        });
        setScheduleDataForPeriod(filteredData);
        
        setStep('dashboard');
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erreur lors de l'importation de la sauvegarde.");
      } finally {
        setIsLoading(false);
        if (event.target) event.target.value = '';
      }
    };
    reader.onerror = () => {
      setError('La lecture du fichier de sauvegarde a échoué.');
      setIsLoading(false);
    }
    reader.readAsText(file);
  };
  
  const handleExportPdf = async () => {
    if (isExportingPdf || isExportingMarkdown) return;
    setIsExportingPdf(true);
    setError(null);
  
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = '-9999px';
    // Use a specific class to apply dark mode if needed
    if (document.documentElement.classList.contains('dark')) {
      exportContainer.classList.add('dark');
    }
    document.body.appendChild(exportContainer);
  
    const root = ReactDOM.createRoot(exportContainer);
    
    // Render the Dashboard component into the off-screen container.
    // It's crucial that the container allows the Dashboard to expand to its full width.
    root.render(
      <div style={{ 
        width: 'fit-content', 
        backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f3f4f6',
        padding: '10px 20px' // Add padding to avoid edge cutoff
      }}>
        <Dashboard
          data={dashboardData}
          width={100}
          tooltipDelay={0} // Disable tooltips for export
          sortOrder={sortOrder}
          moduleColors={moduleColors}
          classTypeColors={classTypeColors}
          pastDateColors={pastDateColors}
          isDarkMode={isDarkMode}
          scrollToDate={null}
          onScrollComplete={() => {}}
        />
      </div>
    );
  
    // Give React a moment to render and styles to apply
    await new Promise(resolve => setTimeout(resolve, 500));
  
    try {
      // Capture the padded container, not just the table, to prevent cutoff.
      const elementToCapture = exportContainer.firstChild as HTMLElement;
      if (!elementToCapture) {
        throw new Error("L'élément à capturer pour le PDF n'a pas pu être trouvé.");
      }
  
      const canvas = await html2canvas(elementToCapture, {
        scale: 2, // Improve quality
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f3f4f6'
      });
  
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      
      // PDF dimensions will match the captured canvas to ensure no cropping
      const pdf = new jsPDF({
        orientation: 'l',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
  
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('tableau-de-bord.pdf');
  
    } catch (err) {
      console.error("Erreur lors de la génération du PDF:", err);
      setError("Une erreur s'est produite lors de la génération du PDF.");
    } finally {
      root.unmount();
      document.body.removeChild(exportContainer);
      setIsExportingPdf(false);
    }
  };

  const handleExportMarkdown = () => {
    if (isExportingMarkdown || isExportingPdf) return;
    setIsExportingMarkdown(true);
    setError(null);
    
    try {
        const data = dashboardData;
        if (!data.length) {
            throw new Error("Aucune donnée à exporter.");
        }

        const formatDateKey = (date: Date): string => date.toISOString().split('T')[0];
        
        const sortTypeNames = (a: string, b: string): number => {
            const getRank = (typeName: string) => {
                if (typeName === 'N/A') return 0;
                if (typeName === 'TDA' || typeName === 'TDB') return 1;
                if (typeName.startsWith('TP')) return 2;
                if (typeName === 'Controle') return 3;
                return 4;
            };
            const rankA = getRank(a);
            const rankB = getRank(b);
            if (rankA !== rankB) return rankA - rankB;
            return a.localeCompare(b);
        };

        const grouped: GroupedByModule = {};
        data.forEach(entry => {
            const moduleKey = `${entry.moduleCode} (${entry.classType})`;
            if (!grouped[moduleKey]) {
                grouped[moduleKey] = {
                    moduleName: entry.module, moduleCode: entry.moduleCode, classType: entry.classType, types: {}
                };
            }
            if (!grouped[moduleKey].types[entry.type]) {
                grouped[moduleKey].types[entry.type] = {};
            }
            const dateKey = formatDateKey(entry.startDate);
            grouped[moduleKey].types[entry.type][dateKey] = (grouped[moduleKey].types[entry.type][dateKey] || 0) + entry.hours;
        });

        const dateSet = new Set<string>();
        data.forEach(entry => dateSet.add(formatDateKey(entry.startDate)));
        const uniqueDates = Array.from(dateSet).sort();

        let processedData = Object.values(grouped).map(mod => {
            let lastSessionDate = '';
            Object.values(mod.types).forEach(typeData => {
                Object.keys(typeData).forEach(dateKey => {
                    if (dateKey > lastSessionDate) lastSessionDate = dateKey;
                });
            });
            return { ...mod, lastSessionDate };
        });

        if (sortOrder === 'date') {
            const moduleFirstDateMap = new Map<string, string>();
            processedData.forEach(mod => {
                const moduleKey = `${mod.moduleCode} (${mod.classType})`;
                const firstDate = uniqueDates.find(date => Object.values(mod.types).some(typeData => typeData[date]));
                if (firstDate) moduleFirstDateMap.set(moduleKey, firstDate);
            });
            processedData.sort((a, b) => {
                const keyA = `${a.moduleCode} (${a.classType})`;
                const keyB = `${b.moduleCode} (${b.classType})`;
                const dateA = moduleFirstDateMap.get(keyA) || '9999-99-99';
                const dateB = moduleFirstDateMap.get(keyB) || '9999-99-99';
                return dateA.localeCompare(dateB);
            });
        } else {
            processedData.sort((a, b) => a.moduleCode.localeCompare(b.moduleCode));
        }

        let md = '';
        const formattedDates = uniqueDates.map(d => new Date(d + 'T00:00:00Z').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
        md += `| Module / Type | Total | ${formattedDates.join(' | ')} |\n`;
        md += `|:---|:---:|${uniqueDates.map(() => ':---:').join('|')}|\n`;

        processedData.forEach((mod) => {
            const moduleTotalHours = Object.values(mod.types).reduce<number>((acc, dateHours) => acc + Object.values(dateHours).reduce<number>((sum, h) => sum + Number(h), 0), 0);
            
            md += `| **${mod.moduleCode} (${mod.classType})** | **${moduleTotalHours.toLocaleString('fr-FR')}h** | ${uniqueDates.map(() => '').join(' | ')} |\n`;

            Object.entries(mod.types)
              .sort(([typeNameA], [typeNameB]) => sortTypeNames(typeNameA, typeNameB))
              .forEach(([typeName, dateHours]) => {
                const typeTotal = Object.values(dateHours).reduce<number>((sum, h) => sum + Number(h), 0);
                const typeRate = moduleTotalHours > 0 ? `${((typeTotal / moduleTotalHours) * 100).toFixed(0)}%` : '0%';
                const dateCells = uniqueDates.map(dateKey => (dateHours[dateKey] ? (dateHours[dateKey] as number).toLocaleString('fr-FR') : '')).join(' | ');
                md += `| ${typeName} | ${typeTotal.toLocaleString('fr-FR')}h (${typeRate}) | ${dateCells} |\n`;
            });

            let runningTotal = 0;
            const cumulativeCells = uniqueDates.map(dateKey => {
                 if (dateKey > mod.lastSessionDate) return '';
                 const dailyTotal = Object.values(mod.types).reduce<number>((acc, typeData) => acc + Number(typeData[dateKey] || 0), 0);
                 runningTotal += dailyTotal;
                 return runningTotal > 0 ? runningTotal.toLocaleString('fr-FR') : '';
            }).join(' | ');
            md += `| *Cumul* | | ${cumulativeCells} |\n`;
            md += `| | | ${uniqueDates.map(() => '').join(' | ')} |\n`;
        });

        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tableau-de-bord.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (err: any) {
        console.error("Erreur lors de la génération du Markdown:", err);
        setError(err.message || "Une erreur est produite lors de la génération du fichier Markdown.");
    } finally {
        setIsExportingMarkdown(false);
    }
  };


  const CustomFileUpload: React.FC<{onFileLoaded: (content: string, file?: File) => void; setLoading: (l: boolean) => void; setError: (e: string|null) => void}> = ({ onFileLoaded, setLoading, setError }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setLoading(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          onFileLoaded(text, file);
          setLoading(false);
        };
        reader.onerror = () => {
          setError('La lecture du fichier a échoué.');
          setLoading(false);
        }
        reader.readAsText(file);
      }
    };
    return (
        <div className="w-full max-w-lg mx-auto">
            <label htmlFor="file-upload" className="relative cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                <LucideIcons.UploadCloud className="w-10 h-10 mb-3 text-gray-500 dark:text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Cliquez pour charger</span> ou glissez-déposez</p>
                <p className="text-xs text-gray-600 dark:text-gray-500">Fichier d'emploi du temps (.ics)</p>
                <input id="file-upload" type="file" className="hidden" accept=".ics" onChange={handleFileChange} />
            </label>
        </div> 
    );
  };
  
  const renderContent = () => {
    switch(step) {
      case 'upload':
        return (
          <div className="text-center p-8 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Bienvenue</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">Pour commencer, chargez un nouveau fichier d'emploi du temps (.ics) ou restaurez une session de travail précédente à partir d'un fichier de sauvegarde (.json).</p>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                  <Loader className="w-12 h-12 text-sky-500 dark:text-sky-400 animate-spin" />
              </div>
            ) : (
              <div>
                <CustomFileUpload onFileLoaded={handleFileLoaded} setLoading={setIsLoading} setError={setError} />

                <div className="w-full max-w-lg mx-auto">
                  <div className="my-6 flex items-center justify-center" aria-hidden="true">
                      <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                      <span className="flex-shrink-0 mx-4 text-sm text-gray-500 dark:text-gray-400">ou</span>
                      <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                
                  <button
                    onClick={() => importInputRef.current?.click()}
                    className="w-full h-24 flex items-center justify-center gap-4 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors p-6"
                    aria-label="Importer une session depuis un fichier .json"
                  >
                    <FileUp className="flex-shrink-0 w-8 h-8 text-gray-500 dark:text-gray-400" />
                    <div className="text-left flex-grow">
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Importer une session sauvegardée</p>
                      <p className="text-xs text-gray-600 dark:text-gray-500">Reprendre depuis un fichier .json</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
            {error && <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>}
          </div>
        );
      case 'date-select':
        return (
          <>
            <DateRangeSelector 
              allEntries={allScheduleData} 
              onConfirm={handleDateRangeSelected} 
              onCancel={handleReset} 
              defaultStartDate={defaultStartDate}
              defaultEndDate={defaultEndDate}
            />
            {error && <p className="mt-4 text-center text-red-500 dark:text-red-400">{error}</p>}
          </>
        );
      case 'dashboard':
        return (
           <div className="h-full flex flex-col">
              <div className="flex-shrink-0 mb-4 flex justify-between items-center gap-4">
                  <p className="text-lg text-gray-600 dark:text-gray-400 truncate">
                      Fichier : <span className="font-semibold text-gray-800 dark:text-gray-200">{fileName}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <ModuleFilter 
                      allModules={availableModules}
                      selectedModules={selectedModules}
                      onSelectionChange={setSelectedModules}
                    />
                    <Tooltip content="Aller à la prochaine date non-échue" delay={300}>
                      <button
                        onClick={handleGoToToday}
                        className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors shadow-md"
                        aria-label="Aller à la prochaine date non échue"
                      >
                        <CalendarClock size={20} />
                      </button>
                    </Tooltip>
                    <button
                      onClick={() => setIsColorSettingsOpen(true)}
                      className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors shadow-md"
                      aria-label="Personnaliser les couleurs"
                    >
                      <Palette size={20} />
                    </button>
                  </div>
              </div>
              <div className="flex-grow overflow-hidden">
                  <Dashboard 
                    data={dashboardData} 
                    width={tableWidth} 
                    tooltipDelay={tooltipDelay} 
                    sortOrder={sortOrder} 
                    moduleColors={moduleColors}
                    classTypeColors={classTypeColors}
                    pastDateColors={pastDateColors}
                    isDarkMode={isDarkMode}
                    scrollToDate={scrollToDate}
                    onScrollComplete={() => setScrollToDate(null)}
                  />
              </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="h-screen flex flex-col p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400">Tableau de Bord de l'Enseignant</h1>
          {step === 'dashboard' && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Ouvrir les paramètres"
            >
              <Settings size={22} />
            </button>
          )}
        </div>
        {step !== 'upload' && (
           <div className="flex items-center gap-2">
              <Tooltip content="Exporter en PDF" delay={300}>
                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf || isExportingMarkdown}
                  className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="Exporter en PDF"
                >
                  {isExportingPdf ? <Loader size={20} className="animate-spin" /> : <FileText size={20} />}
                </button>
              </Tooltip>
              <Tooltip content="Exporter en Markdown (.md)" delay={300}>
                <button
                  onClick={handleExportMarkdown}
                  disabled={isExportingPdf || isExportingMarkdown}
                  className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="Exporter en Markdown"
                >
                  {isExportingMarkdown ? <Loader size={20} className="animate-spin" /> : <FileCode size={20} />}
                </button>
              </Tooltip>
              <Tooltip content="Exporter la session (.json)" delay={300}>
                <button
                  onClick={handleExport}
                  disabled={isExportingPdf || isExportingMarkdown}
                  className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full transition-colors shadow-md"
                  aria-label="Exporter la session"
                >
                  <FileDown size={20} />
                </button>
              </Tooltip>
              <Tooltip content="Importer une session (.json)" delay={300}>
                <button
                  onClick={() => importInputRef.current?.click()}
                  disabled={isExportingPdf || isExportingMarkdown}
                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors shadow-md"
                  aria-label="Importer une session"
                >
                  <FileUp size={20} />
                </button>
              </Tooltip>
              <Tooltip content="Nouveau Fichier (.ics)" delay={300}>
                <button 
                  onClick={handleReset}
                  disabled={isExportingPdf || isExportingMarkdown}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-md"
                  aria-label="Importer un autre fichier ICS"
                >
                 <RefreshCw size={20} />
                </button>
              </Tooltip>
            </div>
        )}
      </header>
      
      <main className="flex-grow overflow-hidden">
        {renderContent()}
      </main>
      
      <footer className="flex-shrink-0 text-center mt-4 text-xs text-gray-400 dark:text-gray-500">
        <p>
          <span>Développé par Eric OU via Google AI Studio - 2025</span>
          <span className="mx-2" aria-hidden="true">|</span>
          <a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); setIsLegalModalOpen(true); }}>Mentions Légales</a>
        </p>
      </footer>

      <input
        type="file"
        ref={importInputRef}
        className="hidden"
        accept=".json"
        onChange={handleImportFileChange}
      />

       <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentWidth={tableWidth}
        currentTooltipDelay={tooltipDelay}
        currentDefaultStartDate={defaultStartDate}
        currentDefaultEndDate={defaultEndDate}
        currentSortOrder={sortOrder}
        currentTheme={theme}
        currentClassTypeColors={classTypeColors}
        currentPastDateColors={pastDateColors}
      />
      <ColorSettingsModal
        isOpen={isColorSettingsOpen}
        onClose={() => setIsColorSettingsOpen(false)}
        onSave={handleSaveColors}
        modules={availableModules}
        currentColors={moduleColors}
      />
      <LegalModal 
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
};

export default App;