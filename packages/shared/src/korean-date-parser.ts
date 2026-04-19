/**
 * 한국어 자연어 → Date 파서
 *
 * 지원 패턴 (대표):
 *   - 상대일:  오늘, 내일, 모레, 글피, 어제, 그제
 *   - 주간:   이번주 / 다음주 / 다다음주 + 요일
 *   - 월간:   이번달 / 다음달 / 월말 / 월초 / 중순
 *   - N-days: 3일 후, 2주 뒤, 한 달 후
 *   - 절대일:  4월 19일, 2026년 4월 19일, 4/19, 4.19
 *   - 시각:   오전 9시, 오후 3시 30분, 새벽 2시, 점심때, 저녁, 아침, 밤
 *   - 데드라인:  ~까지, 마감
 *   - 태그:   #회의 #외근
 *   - 우선순위: !, !!, !!!
 *   - 공휴일: 설날, 추석, 크리스마스 (korean-calendar 모듈 연계)
 *
 * 설계 원칙:
 *   - 순수 함수. 외부 I/O 없음.
 *   - 입력 문자열에서 매칭된 구간을 제거하여 title을 깔끔히 추출.
 *   - Asia/Seoul 고정 (시간대 라이브러리 미도입 단계).
 */

import { getHolidayByName } from "./korean-calendar.js";

export interface ParsedEntry {
  /** 정제된 제목 */
  title: string;
  /** 예정 시각 (KST 기준 ISO 8601) */
  when: string | null;
  /** 마감 시각 (KST 기준 ISO 8601) */
  deadline: string | null;
  /** 종일 여부 */
  allDay: boolean;
  /** 태그 (#프리픽스 제외) */
  tags: string[];
  /** 0 = 없음, 1 = !, 2 = !!, 3 = !!! */
  priority: 0 | 1 | 2 | 3;
  /** 디버깅·UX용 매칭 스팬 */
  matched: Array<{ kind: string; text: string }>;
}

export interface ParseOptions {
  /** 기준 날짜 (기본: 현재 KST). 테스트/재현성 확보용 */
  referenceDate?: Date;
}

const WEEKDAY_MAP: Record<string, number> = {
  "일요일": 0, "일": 0,
  "월요일": 1, "월": 1,
  "화요일": 2, "화": 2,
  "수요일": 3, "수": 3,
  "목요일": 4, "목": 4,
  "금요일": 5, "금": 5,
  "토요일": 6, "토": 6,
};

/** "오전/오후/저녁/..." → 시간 오프셋 */
const TIME_OF_DAY: Record<string, { hour: number; allDay: false }> = {
  "새벽": { hour: 5, allDay: false },
  "아침": { hour: 8, allDay: false },
  "오전": { hour: 10, allDay: false },
  "점심": { hour: 12, allDay: false },
  "점심때": { hour: 12, allDay: false },
  "오후": { hour: 14, allDay: false },
  "저녁": { hour: 19, allDay: false },
  "밤": { hour: 21, allDay: false },
  "자정": { hour: 0, allDay: false },
};

function kstNow(): Date {
  return new Date();
}

function cloneAtMidnight(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function lastDayOfMonth(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toIsoKst(d: Date): string {
  // KST = UTC+9. 개발 단계에선 로컬 시간대가 KST라 가정.
  // 정식 배포 시 date-fns-tz 로 교체.
  return d.toISOString();
}

/** 한 번의 패턴이 소비한 구간을 지우고 공백으로 채움 (인덱스 유지용 아님, 단순 제거) */
function strike(src: string, matchText: string): string {
  const idx = src.indexOf(matchText);
  if (idx < 0) return src;
  return src.slice(0, idx) + src.slice(idx + matchText.length);
}

/** 태그 추출 */
function extractTags(input: string): { cleaned: string; tags: string[] } {
  const tags: string[] = [];
  const cleaned = input.replace(/#([가-힣A-Za-z0-9_]+)/g, (_, tag) => {
    tags.push(tag);
    return "";
  });
  return { cleaned, tags };
}

/** 우선순위 추출 (!!!, !!, !) */
function extractPriority(input: string): { cleaned: string; priority: 0 | 1 | 2 | 3 } {
  const triple = /(^|\s)!!!(?=\s|$)/;
  const dbl = /(^|\s)!!(?=\s|$)/;
  const sgl = /(^|\s)!(?=\s|$)/;
  if (triple.test(input)) return { cleaned: input.replace(triple, "$1"), priority: 3 };
  if (dbl.test(input)) return { cleaned: input.replace(dbl, "$1"), priority: 2 };
  if (sgl.test(input)) return { cleaned: input.replace(sgl, "$1"), priority: 1 };
  return { cleaned: input, priority: 0 };
}

/** 데드라인 마커: "~까지", "까지", "마감" */
function extractDeadlineMarker(input: string): { cleaned: string; isDeadline: boolean; matched?: string } {
  const m = input.match(/(~까지|까지|마감)/);
  if (!m) return { cleaned: input, isDeadline: false };
  return {
    cleaned: input.replace(m[0], " ").replace(/\s+/g, " ").trim(),
    isDeadline: true,
    matched: m[0],
  };
}

/** 시각 파싱 */
function extractTime(input: string): {
  cleaned: string;
  hour?: number;
  minute?: number;
  matched?: string;
} {
  // "오전 9시", "오후 3시 30분", "새벽 2시", "14시 30분", "14:30"
  const ampmHour = input.match(/(오전|오후|새벽|아침|밤|저녁)\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);
  if (ampmHour) {
    let hour = parseInt(ampmHour[2]!, 10);
    const minute = ampmHour[3] ? parseInt(ampmHour[3], 10) : 0;
    const mark = ampmHour[1]!;
    if ((mark === "오후" || mark === "저녁" || mark === "밤") && hour < 12) hour += 12;
    if (mark === "새벽" && hour === 12) hour = 0;
    if (mark === "오전" && hour === 12) hour = 0;
    return { cleaned: strike(input, ampmHour[0]).replace(/\s+/g, " ").trim(), hour, minute, matched: ampmHour[0] };
  }

  const hourOnly = input.match(/(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);
  if (hourOnly) {
    const hour = parseInt(hourOnly[1]!, 10);
    const minute = hourOnly[2] ? parseInt(hourOnly[2], 10) : 0;
    if (hour >= 0 && hour <= 23) {
      return { cleaned: strike(input, hourOnly[0]).replace(/\s+/g, " ").trim(), hour, minute, matched: hourOnly[0] };
    }
  }

  const colon = input.match(/\b(\d{1,2}):(\d{2})\b/);
  if (colon) {
    const hour = parseInt(colon[1]!, 10);
    const minute = parseInt(colon[2]!, 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { cleaned: strike(input, colon[0]).replace(/\s+/g, " ").trim(), hour, minute, matched: colon[0] };
    }
  }

  // "점심때", "저녁", "아침" 등 모호한 시간대
  for (const key of Object.keys(TIME_OF_DAY)) {
    if (input.includes(key)) {
      const { hour } = TIME_OF_DAY[key]!;
      return { cleaned: strike(input, key).replace(/\s+/g, " ").trim(), hour, minute: 0, matched: key };
    }
  }

  return { cleaned: input };
}

/** 상대일 파싱: 오늘/내일/모레/글피/어제/그제 */
function extractRelativeDay(input: string, ref: Date): { cleaned: string; day?: Date; matched?: string } {
  const map: Record<string, number> = {
    "오늘": 0,
    "내일": 1,
    "모레": 2,
    "내일모레": 2,
    "글피": 3,
    "어제": -1,
    "그제": -2,
    "그저께": -2,
  };
  for (const key of Object.keys(map)) {
    if (input.includes(key)) {
      return { cleaned: strike(input, key).replace(/\s+/g, " ").trim(), day: addDays(cloneAtMidnight(ref), map[key]!), matched: key };
    }
  }
  return { cleaned: input };
}

/** 주간: 이번주/다음주/다다음주 + (요일) */
function extractWeekday(input: string, ref: Date): { cleaned: string; day?: Date; matched?: string } {
  const re = /(이번\s*주|다음\s*주|다다음\s*주|담\s*주)?\s*(일요일|월요일|화요일|수요일|목요일|금요일|토요일)/;
  const m = input.match(re);
  if (!m) return { cleaned: input };

  const weekShift = m[1]?.replace(/\s+/g, "") ?? "이번주";
  const weekday = WEEKDAY_MAP[m[2]!]!;

  const base = cloneAtMidnight(ref);
  const curDow = base.getDay();
  let offset = weekday - curDow;
  // 기본 "이번주"가 오늘보다 지났으면 다음주로
  if (weekShift === "이번주" && offset < 0) offset += 7;
  if (weekShift === "다음주" || weekShift === "담주") offset += 7;
  if (weekShift === "다다음주") offset += 14;

  return { cleaned: strike(input, m[0]).replace(/\s+/g, " ").trim(), day: addDays(base, offset), matched: m[0] };
}

/** "N일/N주/N달 후(뒤)" */
function extractNLater(input: string, ref: Date): { cleaned: string; day?: Date; matched?: string } {
  const re = /(\d+|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*(일|주|달|개월|주일)\s*(후|뒤)/;
  const m = input.match(re);
  if (!m) return { cleaned: input };
  const numMap: Record<string, number> = { "한": 1, "두": 2, "세": 3, "네": 4, "다섯": 5, "여섯": 6, "일곱": 7, "여덟": 8, "아홉": 9, "열": 10 };
  const n = Number.isNaN(Number(m[1])) ? numMap[m[1]!] ?? 1 : parseInt(m[1]!, 10);
  const unit = m[2]!;
  const base = cloneAtMidnight(ref);
  let day: Date;
  if (unit === "일") day = addDays(base, n);
  else if (unit === "주" || unit === "주일") day = addDays(base, n * 7);
  else day = addMonths(base, n);
  return { cleaned: strike(input, m[0]).replace(/\s+/g, " ").trim(), day, matched: m[0] };
}

/** 월 관련: 월말 / 월초 / 이번달 말 / 다음달 X일 */
function extractMonth(input: string, ref: Date): { cleaned: string; day?: Date; matched?: string } {
  const base = cloneAtMidnight(ref);

  const monthEnd = input.match(/(이번\s*달|다음\s*달|담\s*달)?\s*(월말|말일)/);
  if (monthEnd) {
    const shift = monthEnd[1]?.replace(/\s+/g, "") === "다음달" || monthEnd[1]?.replace(/\s+/g, "") === "담달" ? 1 : 0;
    const d = lastDayOfMonth(addMonths(base, shift));
    return { cleaned: strike(input, monthEnd[0]).replace(/\s+/g, " ").trim(), day: d, matched: monthEnd[0] };
  }

  const monthStart = input.match(/(이번\s*달|다음\s*달|담\s*달)?\s*(월초|초)/);
  if (monthStart && monthStart[2] === "월초") {
    const shift = monthStart[1]?.replace(/\s+/g, "") === "다음달" || monthStart[1]?.replace(/\s+/g, "") === "담달" ? 1 : 0;
    const x = new Date(base.getFullYear(), base.getMonth() + shift, 1);
    return { cleaned: strike(input, monthStart[0]).replace(/\s+/g, " ").trim(), day: x, matched: monthStart[0] };
  }

  // "다음달 15일", "이번달 3일"
  const monthDay = input.match(/(이번\s*달|다음\s*달|담\s*달)\s*(\d{1,2})\s*일/);
  if (monthDay) {
    const shift = monthDay[1]!.replace(/\s+/g, "") === "이번달" ? 0 : 1;
    const day = parseInt(monthDay[2]!, 10);
    const x = new Date(base.getFullYear(), base.getMonth() + shift, day);
    return { cleaned: strike(input, monthDay[0]).replace(/\s+/g, " ").trim(), day: x, matched: monthDay[0] };
  }

  return { cleaned: input };
}

/** 절대일: "4월 19일", "2026년 4월 19일", "4/19", "4.19" */
function extractAbsoluteDate(input: string, ref: Date): { cleaned: string; day?: Date; matched?: string } {
  const full = input.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (full) {
    const y = parseInt(full[1]!, 10);
    const m = parseInt(full[2]!, 10) - 1;
    const d = parseInt(full[3]!, 10);
    return { cleaned: strike(input, full[0]).replace(/\s+/g, " ").trim(), day: new Date(y, m, d), matched: full[0] };
  }

  const md = input.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (md) {
    const m = parseInt(md[1]!, 10) - 1;
    const d = parseInt(md[2]!, 10);
    const y = ref.getFullYear();
    let day = new Date(y, m, d);
    // 지난 날짜면 내년으로 추정
    if (day.getTime() < cloneAtMidnight(ref).getTime()) day = new Date(y + 1, m, d);
    return { cleaned: strike(input, md[0]).replace(/\s+/g, " ").trim(), day, matched: md[0] };
  }

  const slash = input.match(/\b(\d{1,2})[\/.](\d{1,2})\b/);
  if (slash) {
    const m = parseInt(slash[1]!, 10) - 1;
    const d = parseInt(slash[2]!, 10);
    if (m >= 0 && m < 12 && d >= 1 && d <= 31) {
      const y = ref.getFullYear();
      let day = new Date(y, m, d);
      if (day.getTime() < cloneAtMidnight(ref).getTime()) day = new Date(y + 1, m, d);
      return { cleaned: strike(input, slash[0]).replace(/\s+/g, " ").trim(), day, matched: slash[0] };
    }
  }

  return { cleaned: input };
}

/** 공휴일명 */
function extractHoliday(input: string, ref: Date): { cleaned: string; day?: Date; matched?: string } {
  const names = ["설날", "추석", "크리스마스", "성탄절", "어린이날", "현충일", "광복절", "개천절", "한글날"];
  for (const name of names) {
    if (input.includes(name)) {
      const holiday = getHolidayByName(name, ref.getFullYear());
      if (holiday) {
        return { cleaned: strike(input, name).replace(/\s+/g, " ").trim(), day: holiday, matched: name };
      }
    }
  }
  return { cleaned: input };
}

/** 메인 엔트리 */
export function parseKoreanEntry(raw: string, opts: ParseOptions = {}): ParsedEntry {
  const ref = opts.referenceDate ?? kstNow();
  const matched: ParsedEntry["matched"] = [];

  let working = raw.trim();

  // 1) 태그
  const tagResult = extractTags(working);
  working = tagResult.cleaned;
  if (tagResult.tags.length) matched.push({ kind: "tags", text: tagResult.tags.join(",") });

  // 2) 우선순위
  const prio = extractPriority(working);
  working = prio.cleaned;
  if (prio.priority > 0) matched.push({ kind: "priority", text: "!".repeat(prio.priority) });

  // 3) 데드라인 마커
  const dl = extractDeadlineMarker(working);
  working = dl.cleaned;
  if (dl.matched) matched.push({ kind: "deadlineMarker", text: dl.matched });

  // 4) 날짜 (우선순위: 공휴일 → 절대일 → 월 관련 → N 후 → 요일 → 상대일)
  let day: Date | undefined;
  const pipeline: Array<(s: string, r: Date) => { cleaned: string; day?: Date; matched?: string }> = [
    extractHoliday,
    extractAbsoluteDate,
    extractMonth,
    extractNLater,
    extractWeekday,
    extractRelativeDay,
  ];
  for (const fn of pipeline) {
    if (day) break;
    const res = fn(working, ref);
    if (res.day) {
      day = res.day;
      working = res.cleaned;
      if (res.matched) matched.push({ kind: "date", text: res.matched });
    }
  }

  // 5) 시각
  const t = extractTime(working);
  working = t.cleaned;
  let allDay = true;
  if (t.hour !== undefined) {
    allDay = false;
    if (t.matched) matched.push({ kind: "time", text: t.matched });
  }

  // 6) 최종 Date 조립
  let when: Date | null = null;
  if (day) {
    when = new Date(day);
    if (t.hour !== undefined) {
      when.setHours(t.hour, t.minute ?? 0, 0, 0);
      allDay = false;
    }
  } else if (t.hour !== undefined) {
    // 시각만 있으면 오늘
    when = cloneAtMidnight(ref);
    when.setHours(t.hour, t.minute ?? 0, 0, 0);
    if (when.getTime() < ref.getTime()) when = addDays(when, 1); // 지났으면 내일
    allDay = false;
  }

  const title = working.replace(/\s+/g, " ").trim();

  return {
    title: title || raw.trim(),
    when: !dl.isDeadline && when ? toIsoKst(when) : null,
    deadline: dl.isDeadline && when ? toIsoKst(when) : null,
    allDay,
    tags: tagResult.tags,
    priority: prio.priority,
    matched,
  };
}
