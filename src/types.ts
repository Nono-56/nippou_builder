export type TaskInput = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  content: string;
};

export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing';

export type SyncTasksResponse = {
  tasks: TaskInput[];
  lastSyncedAt: string | null;
};

export type ParsedTask = {
  originalId: string;
  logicalDate: string;
  startMinutes: number;
  endMinutes: number;
  startDisplay: string;
  endDisplay: string;
  content: string;
  durationHours: number;
};

export type GroupedTask = {
  content: string;
  timeRanges: string[];
  startMinutes: number;
  totalDurationHours: number;
};

export type DateGroup = {
  logicalDate: string;
  displayDate: string;
  tasks: GroupedTask[];
};
