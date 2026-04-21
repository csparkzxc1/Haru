import type { TaskItem } from "@/types/task";

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function dayOf(iso: string): number {
  return startOfDay(new Date(iso));
}

function startOfWeek(d: Date): number {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return startOfDay(monday);
}

function endOfWeek(d: Date): number {
  return startOfWeek(d) + 6 * 86400000;
}

export function filterToday(tasks: TaskItem[]): TaskItem[] {
  const todayMs = startOfDay(new Date());
  return tasks.filter((t) => {
    if (t.someday) return false;
    if (t.done) return t.doneAt ? dayOf(t.doneAt) === todayMs : false;
    return (
      (t.when ? dayOf(t.when) === todayMs : false) ||
      (t.deadline ? dayOf(t.deadline) === todayMs : false)
    );
  });
}

export function filterThisWeek(tasks: TaskItem[]): TaskItem[] {
  const now = new Date();
  const weekStartMs = startOfWeek(now);
  const weekEndMs = endOfWeek(now);
  return tasks.filter((t) => {
    if (t.someday || t.done) return false;
    const ref = t.when ?? t.deadline;
    if (!ref) return false;
    const ms = dayOf(ref);
    return ms >= weekStartMs && ms <= weekEndMs;
  });
}

export function filterUpcoming(tasks: TaskItem[]): TaskItem[] {
  const thresholdMs = startOfDay(new Date()) + 7 * 86400000;
  return tasks.filter((t) => {
    if (t.someday || t.done) return false;
    const ref = t.when ?? t.deadline;
    if (!ref) return false;
    return dayOf(ref) >= thresholdMs;
  });
}

export function filterAnytime(tasks: TaskItem[]): TaskItem[] {
  return tasks.filter((t) => !t.when && !t.deadline && !t.someday && !t.done);
}

export function filterSomeday(tasks: TaskItem[]): TaskItem[] {
  return tasks.filter((t) => t.someday === true && !t.done);
}
