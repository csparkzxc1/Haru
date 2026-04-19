/**
 * 한국 공휴일 & 절기 & (간이) 음력 테이블
 *
 * - 양력 고정 공휴일: 코드로 계산
 * - 음력 기반 공휴일(설/추석/부처님오신날): 2024~2030 테이블로 제공
 * - 대체공휴일: "일요일 또는 토요일과 겹치는 설/추석/어린이날/광복절 등"
 *
 * 정확한 음력 변환은 별도 astronomical table 필요 → v1에서는
 * 관보 기반 선공개 테이블을 사용. Phase 3에서 KASI 공공 API 연동 예정.
 */

export interface Holiday {
  name: string;
  date: Date; // KST 기준 자정
  substitute: boolean; // 대체공휴일 여부
}

/** 음력 기반 공휴일 실제 양력 매핑 (관보 기준) */
const LUNAR_HOLIDAYS: Record<number, Array<{ name: string; isoDate: string; daysSpan?: number }>> = {
  2024: [
    { name: "설날", isoDate: "2024-02-10", daysSpan: 3 },
    { name: "부처님오신날", isoDate: "2024-05-15" },
    { name: "추석", isoDate: "2024-09-17", daysSpan: 3 },
  ],
  2025: [
    { name: "설날", isoDate: "2025-01-29", daysSpan: 3 },
    { name: "부처님오신날", isoDate: "2025-05-05" },
    { name: "추석", isoDate: "2025-10-06", daysSpan: 3 },
  ],
  2026: [
    { name: "설날", isoDate: "2026-02-17", daysSpan: 3 },
    { name: "부처님오신날", isoDate: "2026-05-24" },
    { name: "추석", isoDate: "2026-09-25", daysSpan: 3 },
  ],
  2027: [
    { name: "설날", isoDate: "2027-02-07", daysSpan: 3 },
    { name: "부처님오신날", isoDate: "2027-05-13" },
    { name: "추석", isoDate: "2027-09-15", daysSpan: 3 },
  ],
  2028: [
    { name: "설날", isoDate: "2028-01-27", daysSpan: 3 },
    { name: "부처님오신날", isoDate: "2028-05-02" },
    { name: "추석", isoDate: "2028-10-03", daysSpan: 3 },
  ],
  2029: [
    { name: "설날", isoDate: "2029-02-13", daysSpan: 3 },
    { name: "부처님오신날", isoDate: "2029-05-20" },
    { name: "추석", isoDate: "2029-09-22", daysSpan: 3 },
  ],
  2030: [
    { name: "설날", isoDate: "2030-02-03", daysSpan: 3 },
    { name: "부처님오신날", isoDate: "2030-05-09" },
    { name: "추석", isoDate: "2030-09-12", daysSpan: 3 },
  ],
};

/** 양력 고정 공휴일 */
const FIXED_HOLIDAYS: Array<{ name: string; month: number; day: number }> = [
  { name: "신정", month: 1, day: 1 },
  { name: "삼일절", month: 3, day: 1 },
  { name: "어린이날", month: 5, day: 5 },
  { name: "현충일", month: 6, day: 6 },
  { name: "광복절", month: 8, day: 15 },
  { name: "개천절", month: 10, day: 3 },
  { name: "한글날", month: 10, day: 9 },
  { name: "크리스마스", month: 12, day: 25 },
];

function kst(year: number, month: number, day: number): Date {
  const d = new Date(year, month - 1, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseIsoKst(iso: string): Date {
  const [y, m, d] = iso.split("-").map((v) => parseInt(v, 10));
  return kst(y!, m!, d!);
}

/** 대체공휴일이 적용되는 공휴일 목록 (2024년 기준) */
const SUBSTITUTE_ELIGIBLE = new Set([
  "삼일절", "어린이날", "광복절", "개천절", "한글날",
  "설날", "추석", "부처님오신날", "크리스마스",
]);

/** 일요일(0) 또는 공휴일 중복 시 다음 평일로 이동 */
function computeSubstitute(holiday: Holiday, allHolidays: Holiday[]): Holiday | null {
  if (!SUBSTITUTE_ELIGIBLE.has(holiday.name)) return null;
  const dow = holiday.date.getDay();
  // 어린이날은 토요일(6)·일요일(0) 모두 대체
  const needsSub =
    (holiday.name === "어린이날" && (dow === 0 || dow === 6)) ||
    (holiday.name !== "어린이날" && dow === 0);
  if (!needsSub) return null;

  let sub = new Date(holiday.date);
  do {
    sub = new Date(sub);
    sub.setDate(sub.getDate() + 1);
  } while (
    sub.getDay() === 0 ||
    allHolidays.some((h) => h.date.getTime() === sub.getTime())
  );
  return { name: `${holiday.name} 대체공휴일`, date: sub, substitute: true };
}

/** 해당 연도의 모든 공휴일 */
export function getHolidays(year: number): Holiday[] {
  const out: Holiday[] = [];

  for (const f of FIXED_HOLIDAYS) {
    out.push({ name: f.name, date: kst(year, f.month, f.day), substitute: false });
  }

  const lunar = LUNAR_HOLIDAYS[year] ?? [];
  for (const item of lunar) {
    const base = parseIsoKst(item.isoDate);
    const span = item.daysSpan ?? 1;
    if (span === 3 && (item.name === "설날" || item.name === "추석")) {
      // 전날·당일·다음날 3일 연휴
      out.push({ name: `${item.name} 연휴`, date: new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1, 0, 0, 0, 0), substitute: false });
      out.push({ name: item.name, date: base, substitute: false });
      out.push({ name: `${item.name} 연휴`, date: new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1, 0, 0, 0, 0), substitute: false });
    } else {
      out.push({ name: item.name, date: base, substitute: false });
    }
  }

  // 대체공휴일 계산
  const subs: Holiday[] = [];
  for (const h of out) {
    const s = computeSubstitute(h, out.concat(subs));
    if (s) subs.push(s);
  }
  out.push(...subs);

  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out;
}

export function isHoliday(date: Date): Holiday | null {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const list = getHolidays(target.getFullYear());
  return list.find((h) => h.date.getTime() === target.getTime()) ?? null;
}

/** 공휴일 이름으로 해당 연도의 Date 찾기 */
export function getHolidayByName(name: string, year: number): Date | null {
  const list = getHolidays(year);
  const found = list.find((h) => h.name === name || h.name === `${name} 연휴` || h.name.startsWith(name));
  if (found) return found.date;
  // 성탄절 = 크리스마스 동의어
  if (name === "성탄절") return getHolidayByName("크리스마스", year);
  return null;
}

/**
 * 24절기 (대략적 평균일 — 실제 사용 시 한국천문연구원 데이터 필요)
 * Phase 3에서 정확한 절기 데이터 교체 예정.
 */
export const SOLAR_TERMS = [
  "입춘", "우수", "경칩", "춘분", "청명", "곡우",
  "입하", "소만", "망종", "하지", "소서", "대서",
  "입추", "처서", "백로", "추분", "한로", "상강",
  "입동", "소설", "대설", "동지", "소한", "대한",
] as const;

/**
 * 음력 날짜를 양력으로 변환 (v1: LUNAR_HOLIDAYS 테이블 기반 근사)
 * 정식 변환은 Phase 2에서 KASI API 또는 krjs-lunar 모듈로 교체.
 */
export function lunarToSolarApprox(lunarMonth: number, lunarDay: number, year: number): Date | null {
  // v1: 매년 생일·제사 같은 음력 기념일은 사용자가 설정 시 첫 해를 직접 선택하도록 유도.
  // 설/추석/부처님오신날만 우선 지원.
  const table = LUNAR_HOLIDAYS[year] ?? [];
  if (lunarMonth === 1 && lunarDay === 1) {
    const t = table.find((h) => h.name === "설날");
    return t ? parseIsoKst(t.isoDate) : null;
  }
  if (lunarMonth === 8 && lunarDay === 15) {
    const t = table.find((h) => h.name === "추석");
    return t ? parseIsoKst(t.isoDate) : null;
  }
  if (lunarMonth === 4 && lunarDay === 8) {
    const t = table.find((h) => h.name === "부처님오신날");
    return t ? parseIsoKst(t.isoDate) : null;
  }
  return null;
}
