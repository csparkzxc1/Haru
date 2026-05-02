import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { buildIcs } from "./ical";

describe("buildIcs", () => {
  it("VCALENDAR 헤더와 footer 가 있다", () => {
    const ics = buildIcs("Test", []);
    assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
    assert.match(ics, /\r\nEND:VCALENDAR\r\n$/);
    assert.match(ics, /VERSION:2\.0/);
    assert.match(ics, /X-WR-CALNAME:Test/);
  });

  it("종일 이벤트는 VALUE=DATE 형식", () => {
    const ics = buildIcs("X", [
      {
        uid: "abc-123",
        summary: "치과 예약",
        start: new Date("2026-05-02T15:00:00Z"),
        allDay: true,
      },
    ]);
    assert.match(ics, /DTSTART;VALUE=DATE:20260502/);
    assert.doesNotMatch(ics, /DTSTART;VALUE=DATE:20260502T/);
    assert.match(ics, /SUMMARY:치과 예약/);
    assert.match(ics, /UID:abc-123@haru\.app/);
  });

  it("시간 이벤트는 UTC Z 접미", () => {
    const ics = buildIcs("X", [
      {
        uid: "x",
        summary: "회의",
        start: new Date("2026-05-02T06:00:00Z"),
      },
    ]);
    assert.match(ics, /DTSTART:20260502T060000Z/);
  });

  it("쉼표·세미콜론·줄바꿈 이스케이프", () => {
    const ics = buildIcs("X", [
      {
        uid: "x",
        summary: "팀, 회의; 긴급\n바로",
        start: new Date(),
      },
    ]);
    assert.match(ics, /SUMMARY:팀\\,/);
    assert.match(ics, /\\;/);
    assert.match(ics, /\\n/);
  });

  it("75 옥텟 초과 라인은 fold (CRLF + space)", () => {
    const long = "가".repeat(60);
    const ics = buildIcs("X", [
      {
        uid: "x",
        summary: long,
        start: new Date("2026-05-02T00:00:00Z"),
      },
    ]);
    // SUMMARY 라인이 fold 되었는지 확인
    const lines = ics.split("\r\n");
    const summaryIdx = lines.findIndex((l) => l.startsWith("SUMMARY:"));
    assert.ok(summaryIdx >= 0);
    // 다음 라인이 공백으로 시작 = continuation
    assert.ok(lines[summaryIdx + 1]!.startsWith(" "));
  });

  it("이벤트 0개여도 유효한 VCALENDAR", () => {
    const ics = buildIcs("Empty", []);
    assert.doesNotMatch(ics, /BEGIN:VEVENT/);
    assert.doesNotMatch(ics, /END:VEVENT/);
  });
});
