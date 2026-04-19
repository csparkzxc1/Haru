import { QuickEntry } from "@/components/quick-entry";
import { TaskList, type TaskItem } from "@/components/task-list";
import { getHolidays } from "@haru/shared/korean-calendar";

const sample: TaskItem[] = [
  { id: "a", title: "팀 회의", when: addDays(1).toISOString(), tags: ["회의"] },
  { id: "b", title: "주간보고 제출", deadline: addDays(4).toISOString(), tags: ["보고"] },
];

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

export default function ThisWeekPage() {
  const year = new Date().getFullYear();
  const holidaysThisWeek = getHolidays(year).filter((h) => {
    const diff = (h.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">이번주</h1>
        <p className="text-sm text-haru-muted mt-1">
          한국 직장인 선호 뷰 · 월~일
          {holidaysThisWeek.length > 0 && (
            <span className="ml-2 text-haru-accent">
              · 공휴일: {holidaysThisWeek.map((h) => h.name).join(", ")}
            </span>
          )}
        </p>
      </header>
      <QuickEntry />
      <TaskList initial={sample} />
    </>
  );
}
