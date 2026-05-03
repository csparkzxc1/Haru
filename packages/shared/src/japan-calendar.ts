/**
 * 일본 공휴일 (祝日) 모듈.
 *
 * 한국 모듈(korean-calendar.ts) 과 동일한 인터페이스를 의도적으로 따른다.
 * 호출하는 쪽에서 locale 만 갈아끼우면 된다.
 *
 *   import { getHolidays as koHolidays } from "./korean-calendar";
 *   import { getHolidays as jpHolidays } from "./japan-calendar";
 *   const fn = locale === "ja" ? jpHolidays : koHolidays;
 *
 * 데이터 소스:
 *   - 고정일은 「国民の祝日に関する法律」 기반.
 *   - 春分の日 / 秋分の日 는 천체 계산이 필요하지만 v1 단계에선 NAOJ
 *     관측 결과를 다년치 표로 채워 둔다 (2024 ~ 2030).
 *   - ハッピーマンデー (성인의 날 / 바다의 날 / 경로의 날 / 체육의 날) 는
 *     "월요일 N번째" 규칙으로 계산.
 *   - 振替休日 (substitute) 는 일요일과 겹치면 다음 평일.
 */

export interface Holiday {
  name: string;
  date: Date;
  /** 振替休日 여부 */
  substitute: boolean;
}

const FIXED: Array<{ name: string; month: number; day: number }> = [
  { name: "元日", month: 1, day: 1 },
  { name: "建国記念の日", month: 2, day: 11 },
  { name: "天皇誕生日", month: 2, day: 23 },
  { name: "昭和の日", month: 4, day: 29 },
  { name: "憲法記念日", month: 5, day: 3 },
  { name: "みどりの日", month: 5, day: 4 },
  { name: "こどもの日", month: 5, day: 5 },
  { name: "山の日", month: 8, day: 11 },
  { name: "文化の日", month: 11, day: 3 },
  { name: "勤労感謝の日", month: 11, day: 23 },
];

/** ハッピーマンデー — 월요일 N번째. */
const HAPPY_MONDAY: Array<{ name: string; month: number; nth: number }> = [
  { name: "成人の日", month: 1, nth: 2 },
  { name: "海の日", month: 7, nth: 3 },
  { name: "敬老の日", month: 9, nth: 3 },
  { name: "スポーツの日", month: 10, nth: 2 },
];

/** 春分の日 / 秋分の日 — NAOJ 관측 결과 (2024~2030). 이후 연도는 천체 계산 필요. */
const EQUINOX: Record<number, { spring: number; autumn: number }> = {
  2024: { spring: 20, autumn: 22 },
  2025: { spring: 20, autumn: 23 },
  2026: { spring: 20, autumn: 23 },
  2027: { spring: 21, autumn: 23 },
  2028: { spring: 20, autumn: 22 },
  2029: { spring: 20, autumn: 23 },
  2030: { spring: 20, autumn: 23 },
};

function nthMondayOf(year: number, month: number, nth: number): Date {
  // month 는 1-based
  const first = new Date(year, month - 1, 1);
  const offsetToMonday = (8 - first.getDay()) % 7; // sunday=0 → 1, monday=1 → 0
  const day = 1 + offsetToMonday + (nth - 1) * 7;
  return new Date(year, month - 1, day);
}

export function getHolidays(year: number): Holiday[] {
  const out: Holiday[] = [];

  for (const f of FIXED) {
    out.push({ name: f.name, date: new Date(year, f.month - 1, f.day), substitute: false });
  }
  for (const h of HAPPY_MONDAY) {
    out.push({ name: h.name, date: nthMondayOf(year, h.month, h.nth), substitute: false });
  }
  const eq = EQUINOX[year];
  if (eq) {
    out.push({ name: "春分の日", date: new Date(year, 2, eq.spring), substitute: false });
    out.push({ name: "秋分の日", date: new Date(year, 8, eq.autumn), substitute: false });
  }

  // 振替休日 — 일요일이면 다음 평일로 보충 일정 추가.
  const additions: Holiday[] = [];
  for (const h of out) {
    if (h.date.getDay() === 0) {
      const sub = new Date(h.date);
      sub.setDate(sub.getDate() + 1);
      additions.push({ name: `${h.name}（振替）`, date: sub, substitute: true });
    }
  }
  out.push(...additions);

  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out;
}

export function isHoliday(d: Date): Holiday | null {
  const y = d.getFullYear();
  const target = new Date(y, d.getMonth(), d.getDate()).getTime();
  return getHolidays(y).find((h) => h.date.getTime() === target) ?? null;
}

export function getHolidayByName(name: string, year: number): Date | null {
  return getHolidays(year).find((h) => h.name === name)?.date ?? null;
}
