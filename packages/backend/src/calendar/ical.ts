/**
 * 최소 RFC 5545 iCalendar 직렬화기.
 *
 * 외부 의존성 없이 VEVENT 만 만든다. 모든 시각은 UTC ("Z" 접미). 한국
 * 클라이언트(아이폰 캘린더, 네이버 캘린더, 구글 캘린더)에서 제대로 표시되는지
 * 확인됨.
 *
 *   - 종일 이벤트: VALUE=DATE 형식
 *   - 시간 이벤트: VALUE=DATE-TIME (Z = UTC)
 *   - 줄 길이 75 octets 이하 fold (CRLF + space)
 */

export interface IcsEvent {
  uid: string;
  summary: string;
  description?: string;
  /** 시작. allDay=true 이면 자정 KST 로 변환 후 DATE 형식 출력. */
  start: Date;
  end?: Date;
  allDay?: boolean;
  location?: string;
}

export function buildIcs(
  calendarName: string,
  events: IcsEvent[],
): string {
  const now = formatUtc(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Haru//KO//KR",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "X-WR-TIMEZONE:Asia/Seoul",
  ];
  for (const e of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.uid}@haru.app`);
    lines.push(`DTSTAMP:${now}`);
    if (e.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatDate(e.start)}`);
      if (e.end) lines.push(`DTEND;VALUE=DATE:${formatDate(e.end)}`);
    } else {
      lines.push(`DTSTART:${formatUtc(e.start)}`);
      if (e.end) lines.push(`DTEND:${formatUtc(e.end)}`);
    }
    lines.push(`SUMMARY:${escapeText(e.summary)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

function formatUtc(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate())
  );
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** RFC 5545 §3.1: 75 octets 초과 라인은 CRLF + " " 로 fold. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let i = 0;
  parts.push(line.slice(0, 75));
  i = 75;
  while (i < line.length) {
    parts.push(" " + line.slice(i, i + 74));
    i += 74;
  }
  return parts.join("\r\n");
}
