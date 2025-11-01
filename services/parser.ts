import { ScheduleEntry } from '../types';

declare const ICAL: any; // ICAL is a global from the script tag in index.html

const KNOWN_TYPES = ["TDA", "TDB", "TP1", "TP2", "TP3", "Controle"];

// Helper to parse the complex title into a module name, a type, and a class type
const parseTitle = (title: string): { module: string; moduleCode: string; type: string; classType: 'Apprentis' | 'Initiaux' } => {
  let words = title.split(/\s+/).filter(Boolean);
  let typeIndex = -1;

  // Determine class type and remove "APP" if it exists
  const isApp = words.includes("APP");
  const classType = isApp ? 'Apprentis' : 'Initiaux';
  if (isApp) {
    words = words.filter(word => word !== "APP");
  }

  // Find the course type (TDA, TP1, etc.)
  for (let i = words.length - 1; i >= 0; i--) {
    if (KNOWN_TYPES.includes(words[i])) {
      typeIndex = i;
      break;
    }
  }

  let module = title.replace(/\s+APP\s+/g, ' ').trim();
  let type = "N/A";

  if (typeIndex !== -1) {
    type = words[typeIndex];
    // Reconstruct the module name without the type and potential trailing session info
    const tempWords = title.split(/\s+/).filter(Boolean);
    const typeLocation = tempWords.lastIndexOf(type);
    module = tempWords.slice(0, typeLocation).filter(w => w !== "APP").join(' ');
  }
  
  // Extract module code using regex, looking for patterns like R5.09 or SAe 3.OSC.03
  const codeMatch = module.match(/(^R\d(\.[\w\d]+)+)|(^SAe\s\d(\.[\w\d]+)+)/i);
  const moduleCode = codeMatch ? codeMatch[0].trim() : module.split(' ')[0]; // Fallback to first word

  return { module, moduleCode, type, classType };
};

export const parseICSContent = (icsText: string): ScheduleEntry[] => {
  const entries: ScheduleEntry[] = [];
  try {
    const jcalData = ICAL.parse(icsText);
    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents('vevent');

    vevents.forEach((vevent: any) => {
      const event = new ICAL.Event(vevent);
      
      const title = event.summary;
      
      // Use UTC to create dates to avoid timezone shifting issues
      const sd = event.startDate;
      const startDate = new Date(Date.UTC(sd.year, sd.month - 1, sd.day, sd.hour, sd.minute, sd.second));
      
      const ed = event.endDate;
      const endDate = new Date(Date.UTC(ed.year, ed.month - 1, ed.day, ed.hour, ed.minute, ed.second));

      const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

      // We still need a reliable way to get HH:MM format in local time for display
      const startTime = new Date(event.startDate.toString()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
      const endTime = new Date(event.endDate.toString()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });

      const { module, moduleCode, type, classType } = parseTitle(title);

      entries.push({
        startDate,
        title,
        hours,
        startTime,
        endTime,
        module,
        moduleCode,
        type,
        classType,
      });
    });
  } catch (error) {
    console.error("Impossible d'analyser le fichier ICS :", error);
    throw new Error("Le format du fichier ICS est invalide.");
  }

  return entries;
};