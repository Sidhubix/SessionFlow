
import React, { useMemo, useRef, useEffect } from 'react';
import { ScheduleEntry, GroupedByModule } from '../types';
import Tooltip from './Tooltip';

interface DashboardProps {
  data: ScheduleEntry[];
  width: number;
  tooltipDelay: number;
  sortOrder: 'date' | 'code';
  moduleColors: { [key: string]: string };
  classTypeColors: { apprentice: string, initial: string };
  pastDateColors: { light: string, dark: string };
  isDarkMode: boolean;
  scrollToDate: string | null;
  onScrollComplete: () => void;
}

const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const Dashboard: React.FC<DashboardProps> = ({ data, width, tooltipDelay, sortOrder, moduleColors, classTypeColors, pastDateColors, isDarkMode, scrollToDate, onScrollComplete }) => {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);
  const pastDateBgColor = isDarkMode ? pastDateColors.dark : pastDateColors.light;

  const { processedData, uniqueDates } = useMemo(() => {
    if (!data.length) {
      return { processedData: [], uniqueDates: [] };
    }

    const grouped: GroupedByModule = {};

    data.forEach(entry => {
      const moduleKey = `${entry.moduleCode} (${entry.classType})`;

      if (!grouped[moduleKey]) {
        grouped[moduleKey] = {
            moduleName: entry.module,
            moduleCode: entry.moduleCode,
            classType: entry.classType,
            types: {}
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

    // Convert grouped object to array and add last session date
    let dataArray = Object.values(grouped).map(mod => {
        let lastSessionDate = '';
        Object.values(mod.types).forEach(typeData => {
            Object.keys(typeData).forEach(dateKey => {
                if (dateKey > lastSessionDate) {
                    lastSessionDate = dateKey;
                }
            });
        });
        return { ...mod, lastSessionDate };
    });

    // Sort the array based on the sortOrder prop
    if (sortOrder === 'date') {
        const moduleFirstDateMap = new Map<string, string>();
        dataArray.forEach(mod => {
            const moduleKey = `${mod.moduleCode} (${mod.classType})`;
            const firstDate = uniqueDates.find(date => 
                Object.values(mod.types).some(typeData => typeData[date])
            );
            if (firstDate) {
                moduleFirstDateMap.set(moduleKey, firstDate);
            }
        });

        dataArray.sort((a, b) => {
            const keyA = `${a.moduleCode} (${a.classType})`;
            const keyB = `${b.moduleCode} (${b.classType})`;
            const dateA = moduleFirstDateMap.get(keyA) || '9999-99-99';
            const dateB = moduleFirstDateMap.get(keyB) || '9999-99-99';
            return dateA.localeCompare(dateB);
        });

    } else { // sortOrder === 'code'
        dataArray.sort((a, b) => a.moduleCode.localeCompare(b.moduleCode));
    }

    return { processedData: dataArray, uniqueDates };
  }, [data, sortOrder]);

  useEffect(() => {
    const leftEl = leftRef.current;
    const rightEl = rightRef.current;
    if (!leftEl || !rightEl) return;

    let syncFrom: 'left' | 'right' | null = null;

    const handleLeftScroll = () => {
        if (syncFrom === 'right') return;
        syncFrom = 'left';
        if (rightEl) {
            rightEl.scrollTop = leftEl.scrollTop;
        }
    };

    const handleRightScroll = () => {
        if (syncFrom === 'left') return;
        syncFrom = 'right';
        if (leftEl) {
            leftEl.scrollTop = rightEl.scrollTop;
        }
    };
    
    const resetSync = () => {
        syncFrom = null;
    };

    leftEl.addEventListener('scroll', handleLeftScroll);
    rightEl.addEventListener('scroll', handleRightScroll);
    leftEl.addEventListener('mouseenter', resetSync);
    rightEl.addEventListener('mouseenter', resetSync);


    return () => {
      leftEl.removeEventListener('scroll', handleLeftScroll);
      rightEl.removeEventListener('scroll', handleRightScroll);
      leftEl.removeEventListener('mouseenter', resetSync);
      rightEl.removeEventListener('mouseenter', resetSync);
    };
  }, []);

  useEffect(() => {
    if (scrollToDate && rightRef.current) {
      // Find the first date key that is >= today's date key
      const targetDateKey = uniqueDates.find(dateKey => dateKey >= scrollToDate);
  
      if (targetDateKey) {
        const headerRow = rightRef.current.querySelector('thead tr');
        if (headerRow) {
          const dateIndex = uniqueDates.indexOf(targetDateKey);
          if (dateIndex !== -1) {
            const thElement = headerRow.children[dateIndex] as HTMLElement;
            if (thElement) {
              thElement.scrollIntoView({
                behavior: 'smooth',
                inline: 'start', // scroll horizontally
                block: 'nearest' // don't scroll vertically
              });
            }
          }
        }
      }
      // Always call onScrollComplete to reset the trigger state in the parent
      onScrollComplete();
    }
  }, [scrollToDate, onScrollComplete, uniqueDates]);


  if (!data.length) {
    return null;
  }

  const tableContainerStyle = {
    width: `${width}%`,
  };

  const sortTypeNames = (a: string, b: string): number => {
    const getRank = (typeName: string) => {
        if (typeName === 'N/A') return 0; // Cours
        if (typeName === 'TDA' || typeName === 'TDB') return 1; // TD
        if (typeName.startsWith('TP')) return 2; // TP
        if (typeName === 'Controle') return 3; // Controle
        return 4; // Autres
    };

    const rankA = getRank(a);
    const rankB = getRank(b);

    if (rankA !== rankB) {
        return rankA - rankB;
    }

    return a.localeCompare(b); // Pour trier TP1, TP2, etc.
  };

  const renderTableBody = (side: 'left' | 'right') => (
    <tbody>
      {processedData.map(({ moduleName, moduleCode, classType, types, lastSessionDate }) => {
         const moduleTotalHours = Object.values(types).reduce<number>((acc, dateHours) => acc + Object.values(dateHours).reduce<number>((sum, h) => sum + Number(h), 0), 0);
         let runningTotal = 0;
         const cumulativeTotals = uniqueDates.map(dateKey => {
             const dailyTotal = Object.values(types).reduce<number>((acc, typeData) => acc + Number(typeData[dateKey] || 0), 0);
             runningTotal += dailyTotal;
             return runningTotal > 0 ? runningTotal : null;
         });
        
         const moduleKey = `${moduleCode} (${classType})`;
         const headerStyle = {
           backgroundColor: moduleColors[moduleKey] || '' 
         };
         const headerCellStyle: { borderTop: string, borderTopColor?: string } = {
          borderTop: '4px solid #f3f4f6', // gray-100
         };
         headerCellStyle.borderTop = isDarkMode ? '4px solid #111827' : '4px solid #f3f4f6'; // gray-900 for dark, gray-100 for light

        return (
          <React.Fragment key={`${moduleCode}-${classType}`}>
            <tr className={`h-16 text-white ${!moduleColors[moduleKey] ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' : ''}`} style={headerStyle}>
              {side === 'left' ? (
                <>
                  <td 
                    className="p-2 font-bold text-base border-b border-gray-300 dark:border-gray-600 w-48"
                    style={headerCellStyle}
                  >
                    <Tooltip content={moduleName} delay={tooltipDelay}>
                      <span>
                        {moduleCode}
                        {classType && (
                          <span 
                            className="ml-2 font-semibold"
                            style={{ color: classType === 'Apprentis' ? classTypeColors.apprentice : classTypeColors.initial }}
                          >
                            ({classType})
                          </span>
                        )}
                      </span>
                    </Tooltip>
                  </td>
                  <td 
                    className="p-2 border-b border-gray-300 dark:border-gray-600 w-24"
                    style={headerCellStyle}
                  >
                  </td>
                </>
              ) : (
                <td colSpan={uniqueDates.length} className="p-2 border-b border-gray-300 dark:border-gray-600" style={headerCellStyle}>
                </td>
              )}
            </tr>

            {Object.entries(types)
              .sort(([typeNameA], [typeNameB]) => sortTypeNames(typeNameA, typeNameB))
              .map(([typeName, dateHours]) => {
              const typeTotal = Object.values(dateHours).reduce<number>((sum, h) => sum + Number(h), 0);
              const typeRate = moduleTotalHours > 0 ? ((typeTotal / moduleTotalHours) * 100).toFixed(0) + '%' : '0%';
              return (
                <tr key={typeName} className="group transition-colors h-14">
                  {side === 'left' ? (
                    <>
                       <td className="bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 text-left pl-4 w-48 align-middle group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
                          {typeName}
                       </td>
                       <td className="bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 text-center font-semibold w-24 align-middle group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
                         <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">{typeRate}</span>
                            <span className="text-amber-600 dark:text-amber-400">{typeTotal.toLocaleString('fr-FR')}h</span>
                         </div>
                      </td>
                    </>
                  ) : (
                    <>
                       {uniqueDates.map(dateKey => {
                          const isPastDate = dateKey < todayKey;
                          const isLastSession = dateKey === lastSessionDate;
                          
                          const cellStyle: React.CSSProperties = {};
                          let className = 'p-2 border border-gray-200 dark:border-gray-700 text-center text-sm font-mono group-hover:bg-gray-200 dark:group-hover:bg-gray-700';

                          if (isLastSession) {
                            className += ' bg-red-200/60 dark:bg-red-900/40';
                          } else if (isPastDate) {
                            cellStyle.backgroundColor = pastDateBgColor;
                          } else {
                            className += ' bg-white dark:bg-gray-800';
                          }
                          
                          return (
                            <td key={dateKey} style={cellStyle} className={className}>
                              {dateHours[dateKey] ? <span className="bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">{(dateHours[dateKey] as number).toLocaleString('fr-FR')}</span> : ''}
                            </td>
                          );
                        })}
                    </>
                  )}
                </tr>
              )
            })}

             <tr className="bg-white dark:bg-gray-800 font-bold h-14">
              {side === 'left' ? (
                <>
                  <td className="p-2 border-b border-gray-200 dark:border-gray-700 text-left text-green-600 dark:text-green-300 w-48 align-middle">Cumul ></td>
                  <td className="p-2 border-b border-gray-200 dark:border-gray-700 text-center font-bold text-green-600 dark:text-green-300 w-24 align-middle">
                    {moduleTotalHours.toLocaleString('fr-FR')}h
                  </td>
                </>
              ) : (
                <>
                  {cumulativeTotals.map((total, index) => {
                      const dateKey = uniqueDates[index];
                      const isPastDate = dateKey < todayKey;
                      const isLastSession = dateKey === lastSessionDate;
                      const showTotal = dateKey <= lastSessionDate && total !== null;

                      const cellStyle: React.CSSProperties = {};
                      let className = 'p-2 border border-gray-200 dark:border-gray-700 text-center font-mono text-green-600 dark:text-green-300';

                      if (isLastSession) {
                          className += ' bg-red-200/60 dark:bg-red-900/40';
                      } else if (isPastDate) {
                          cellStyle.backgroundColor = pastDateBgColor;
                      } else {
                          className += ' bg-white dark:bg-gray-800';
                      }

                      return (
                        <td key={dateKey} style={cellStyle} className={className}>
                           {showTotal ? total!.toLocaleString('fr-FR') : ''}
                        </td>
                      );
                  })}
                </>
              )}
             </tr>
          </React.Fragment>
        );
      })}
    </tbody>
  );

  return (
    <div className="h-full flex" style={tableContainerStyle}>
      {/* Left Fixed Table */}
      <div ref={leftRef} className="flex-shrink-0 overflow-y-auto" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-100 dark:bg-gray-800 h-12">
              <th className="p-2 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 w-48">Type</th>
              <th className="p-2 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 w-24">Taux</th>
            </tr>
          </thead>
          {renderTableBody('left')}
        </table>
      </div>

      {/* Right Scrollable Table */}
      <div ref={rightRef} className="flex-grow overflow-auto" style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
         <table className="border-collapse w-full">
            <thead className="sticky top-0 z-10">
                <tr className="bg-gray-100 dark:bg-gray-800 h-12">
                    {uniqueDates.map(dateStr => {
                        const isPastDate = dateStr < todayKey;
                        const thStyle = isPastDate ? { backgroundColor: pastDateBgColor } : {};
                        return (
                          <th key={dateStr} style={thStyle} className={`p-2 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap ${isPastDate ? '' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              {new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </th>
                        );
                    })}
                </tr>
            </thead>
            {renderTableBody('right')}
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
