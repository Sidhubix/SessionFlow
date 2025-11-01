export interface ScheduleEntry {
  startDate: Date;
  title: string;
  hours: number;
  startTime: string;
  endTime: string;
  module: string;
  moduleCode: string;
  type: string;
  classType: 'Apprentis' | 'Initiaux';
}

export type ViewMode = 'module' | 'week';

export interface GroupedByModule {
  [moduleKey: string]: { // A unique key like "R5.09 (Initiaux)"
    moduleName: string;
    moduleCode: string;
    classType: 'Apprentis' | 'Initiaux';
    types: {
      [typeName: string]: {
        [dateKey: string]: number; // dateKey is YYYY-MM-DD
      }
    }
  }
}