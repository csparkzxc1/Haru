/**
 * 에브리타임 시간표 텍스트 파서.
 *
 * 에브리타임은 외부 API 를 공개하지 않으므로 사용자가 시간표 페이지에서
 * 복사한 텍스트(또는 OCR 결과)를 그대로 받아 파싱한다. 가능한 입력 형식:
 *
 *   1) 행별 텍스트 (대학가 가장 흔한 복사 결과):
 *
 *      자료구조 IF103 김교수
 *      월 09:00-10:30
 *      수 09:00-10:30
 *      ---
 *      운영체제 IF205 박교수
 *      화 13:00-14:30
 *      목 13:00-14:30
 *
 *   2) 한 줄 형식: "자료구조 / 월수 09:00-10:30 / 김교수"
 *
 * 결과는 강의 단위 + 주간 반복 슬롯의 배열. 사용자는 이를 토대로 매주
 * 반복되는 Task 또는 캘린더 이벤트를 일괄 생성할 수 있다.
 */

export interface EverytimeSlot {
  /** 0=일요일 ~ 6=토요일 */
  weekday: number;
  /** "HH:mm" KST */
  startTime: string;
  endTime: string;
}

export interface EverytimeCourse {
  title: string;
  code?: string;
  professor?: string;
  location?: string;
  slots: EverytimeSlot[];
}

const WEEKDAY_MAP: Record<string, number> = {
  일: 0,
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6,
};

function parseTimeRange(s: string): { start: string; end: string } | null {
  const m = s.match(/(\d{1,2}):(\d{2})\s*[-~–]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const pad = (n: string) => n.padStart(2, "0");
  return {
    start: `${pad(m[1]!)}:${m[2]!}`,
    end: `${pad(m[3]!)}:${m[4]!}`,
  };
}

/** "월수금" 같은 연속 요일 문자열을 분해. */
function expandWeekdays(s: string): number[] {
  const out: number[] = [];
  for (const ch of s) {
    if (WEEKDAY_MAP[ch] !== undefined) out.push(WEEKDAY_MAP[ch]!);
  }
  return out;
}

/**
 * 형식 1 (행별) 우선 시도. 실패 시 형식 2 (한 줄) 으로 fallback.
 * 항상 best-effort — 인식 못 한 라인은 조용히 무시한다.
 */
export function parseEverytime(input: string): EverytimeCourse[] {
  const text = input.trim();
  if (!text) return [];

  // 형식 2: 슬래시 구분
  if (text.includes("/")) {
    return parseSlashFormat(text);
  }
  return parseBlockFormat(text);
}

function parseBlockFormat(text: string): EverytimeCourse[] {
  // 빈 줄 또는 "---" 로 강의 분리
  const blocks = text
    .split(/\n\s*(?:---+|\n)/)
    .map((b) => b.trim())
    .filter(Boolean);

  const courses: EverytimeCourse[] = [];
  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    // 첫 줄: "<제목> [코드] [교수]"
    const header = lines[0]!;
    const headerParts = header.split(/\s+/);
    const title = headerParts[0]!;
    const code = headerParts[1];
    const professor = headerParts.length > 2 ? headerParts.slice(2).join(" ") : undefined;

    const slots: EverytimeSlot[] = [];
    let location: string | undefined;
    for (const line of lines.slice(1)) {
      // "월 09:00-10:30 [강의실]"
      const m = line.match(/^(일|월|화|수|목|금|토)\s+(\d{1,2}:\d{2}\s*[-~–]\s*\d{1,2}:\d{2})(?:\s+(.+))?$/);
      if (m) {
        const range = parseTimeRange(m[2]!);
        if (!range) continue;
        slots.push({
          weekday: WEEKDAY_MAP[m[1]!]!,
          startTime: range.start,
          endTime: range.end,
        });
        if (m[3]) location = m[3].trim();
      }
    }

    if (slots.length > 0) {
      courses.push({ title, code, professor, location, slots });
    }
  }
  return courses;
}

function parseSlashFormat(text: string): EverytimeCourse[] {
  const courses: EverytimeCourse[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const parts = line.split(/\s*\/\s*/);
    if (parts.length < 2) continue;

    const title = parts[0]!;
    // 슬롯 부분: "월수 09:00-10:30" 또는 "월 09:00-10:30, 수 09:00-10:30"
    const slotsPart = parts[1]!;
    const professor = parts[2];

    const slots: EverytimeSlot[] = [];
    for (const segment of slotsPart.split(/[,;]/)) {
      const m = segment
        .trim()
        .match(/^([일월화수목금토]+)\s+(\d{1,2}:\d{2}\s*[-~–]\s*\d{1,2}:\d{2})$/);
      if (!m) continue;
      const range = parseTimeRange(m[2]!);
      if (!range) continue;
      for (const wd of expandWeekdays(m[1]!)) {
        slots.push({ weekday: wd, startTime: range.start, endTime: range.end });
      }
    }

    if (slots.length > 0) {
      courses.push({ title, professor, slots });
    }
  }
  return courses;
}
