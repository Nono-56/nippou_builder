import type { TaskInput, ParsedTask, GroupedTask, DateGroup, WeekTotal } from './types';

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToDisplayTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}

export const parseTask = (task: TaskInput): ParsedTask => {
  let startMn = parseTimeToMinutes(task.startTime);
  let endMn = parseTimeToMinutes(task.endTime);

  if (endMn < startMn) {
    endMn += 24 * 60;
  }

  const dateObj = new Date(task.date);

  if (startMn >= 0 && startMn < 6 * 60) {
    dateObj.setDate(dateObj.getDate() - 1);
    startMn += 24 * 60;
    endMn += 24 * 60;
  }

  const yyyyy = dateObj.getFullYear();
  const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const dd = dateObj.getDate().toString().padStart(2, '0');
  const logicalDate = `${yyyyy}-${mm}-${dd}`;
  const durationHours = (endMn - startMn) / 60;

  return {
    originalId: task.id,
    logicalDate,
    startMinutes: startMn,
    endMinutes: endMn,
    startDisplay: minutesToDisplayTime(startMn),
    endDisplay: minutesToDisplayTime(endMn),
    content: task.content,
    durationHours
  };
};

export const groupTasks = (tasks: TaskInput[]): DateGroup[] => {
  const parsed = tasks.map(parseTask).sort((a, b) => {
    if (a.logicalDate !== b.logicalDate) {
      return a.logicalDate.localeCompare(b.logicalDate);
    }
    return a.startMinutes - b.startMinutes;
  });

  const dateMap = new Map<string, ParsedTask[]>();
  parsed.forEach(p => {
    if (!dateMap.has(p.logicalDate)) {
      dateMap.set(p.logicalDate, []);
    }
    dateMap.get(p.logicalDate)!.push(p);
  });

  const dateGroups: DateGroup[] = [];
  const sortedDates = Array.from(dateMap.keys()).sort();

  sortedDates.forEach(logicalDate => {
    const dailyTasks = dateMap.get(logicalDate)!;
    const contentMap = new Map<string, GroupedTask>();

    dailyTasks.forEach(pt => {
      if (!contentMap.has(pt.content)) {
        contentMap.set(pt.content, {
          content: pt.content,
          timeRanges: [],
          startMinutes: pt.startMinutes,
          totalDurationHours: 0
        });
      }
      const ct = contentMap.get(pt.content)!;
      ct.timeRanges.push(`${pt.startDisplay}-${pt.endDisplay}`);
      ct.totalDurationHours += pt.durationHours;
      if (pt.startMinutes < ct.startMinutes) {
        ct.startMinutes = pt.startMinutes;
      }
    });

    const displayDate = (() => {
      const parts = logicalDate.split('-');
      return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
    })();

    const groupedTasks = Array.from(contentMap.values()).sort((a, b) => a.startMinutes - b.startMinutes);

    dateGroups.push({
      logicalDate,
      displayDate,
      tasks: groupedTasks
    });
  });

  return dateGroups;
};

export const formatReport = (groups: DateGroup[], includeDate: boolean): string => {
  const forceDate = groups.length > 1;
  const showDate = includeDate || forceDate;

  let out = "";
  groups.forEach((g, idx) => {
    if (showDate) {
      out += `${g.displayDate}\n`;
    }
    g.tasks.forEach(t => {
      const hours = Math.round(t.totalDurationHours * 10) / 10;
      out += `${t.timeRanges.join(',')} (${hours}h) ${t.content}\n`;
    });
    if (idx < groups.length - 1) {
      out += "\n";
    }
  });

  return out.trim();
};

function parseDateParts(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatShortDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getWeekStartDate(logicalDate: string): Date {
  const date = parseDateParts(logicalDate);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - daysSinceMonday);
  return date;
}

function roundHours(hours: number): number {
  return Math.round(hours * 10) / 10;
}

function getWeeklyCategory(content: string): string {
  const category = content.split(/[|｜]/, 1)[0]?.trim();
  return category || content.trim() || '未分類';
}

export const calculateWeekTotals = (tasks: TaskInput[]): WeekTotal[] => {
  const totals = new Map<string, WeekTotal>();

  tasks.map(parseTask).forEach((task) => {
    const weekStartDate = getWeekStartDate(task.logicalDate);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    const weekStart = formatDateKey(weekStartDate);
    const category = getWeeklyCategory(task.content);
    const existing = totals.get(weekStart);

    if (existing) {
      existing.totalHours += task.durationHours;
      const existingCategory = existing.categories.find((item) => item.category === category);
      if (existingCategory) {
        existingCategory.totalHours += task.durationHours;
      } else {
        existing.categories.push({ category, totalHours: task.durationHours });
      }
      return;
    }

    totals.set(weekStart, {
      weekStart,
      weekEnd: formatDateKey(weekEndDate),
      displayRange: `${formatShortDate(weekStartDate)} 6:00-${formatShortDate(weekEndDate)} 5:59`,
      totalHours: task.durationHours,
      categories: [{ category, totalHours: task.durationHours }],
    });
  });

  return Array.from(totals.values())
    .map((week) => ({
      ...week,
      totalHours: roundHours(week.totalHours),
      categories: week.categories
        .map((category) => ({
          ...category,
          totalHours: roundHours(category.totalHours),
        }))
        .sort((a, b) => {
          if (b.totalHours !== a.totalHours) {
            return b.totalHours - a.totalHours;
          }
          return a.category.localeCompare(b.category, 'ja');
        }),
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
};
