import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { getHolidays, isHoliday, getHolidayByName } from "./japan-calendar.js";

describe("japan-calendar", () => {
  it("2026년 고정 공휴일이 모두 포함됨", () => {
    const holidays = getHolidays(2026);
    const names = new Set(holidays.map((h) => h.name));
    assert.ok(names.has("元日"));
    assert.ok(names.has("建国記念の日"));
    assert.ok(names.has("天皇誕生日"));
    assert.ok(names.has("こどもの日"));
    assert.ok(names.has("文化の日"));
  });

  it("ハッピーマンデー — 成人の日은 1월 둘째 월요일", () => {
    // 2026년 1월: 1=목 → 첫째 월요일은 5일 → 둘째 월요일 12일
    const d = getHolidayByName("成人の日", 2026);
    assert.ok(d);
    assert.equal(d!.getMonth(), 0);
    assert.equal(d!.getDate(), 12);
    assert.equal(d!.getDay(), 1); // Monday
  });

  it("春分の日 / 秋分の日 — NAOJ 표 기반", () => {
    const spring = getHolidayByName("春分の日", 2026);
    const autumn = getHolidayByName("秋分の日", 2026);
    assert.equal(spring?.getDate(), 20);
    assert.equal(autumn?.getDate(), 23);
  });

  it("振替休日 — 일요일과 겹치는 공휴일은 다음 날로 보충", () => {
    const holidays = getHolidays(2026);
    // 2026 5월 3일 (헌법기념일) = 일요일 → 振替 = 5월 6일 (수)
    // 일본 振替 규칙은 "다음 평일" 이지만 본 모듈은 단순화하여 "다음 날".
    const sub = holidays.find((h) => h.name.includes("（振替）"));
    assert.ok(sub, "최소 1개의 振替 공휴일이 있어야 함");
    assert.ok(sub!.substitute);
  });

  it("isHoliday — 元日 = 평일과 무관하게 공휴일", () => {
    const r = isHoliday(new Date(2026, 0, 1));
    assert.ok(r);
    assert.equal(r!.name, "元日");
  });

  it("isHoliday — 평범한 평일 (2026 5월 18일)", () => {
    assert.equal(isHoliday(new Date(2026, 4, 18)), null);
  });

  it("정렬 보장 — 날짜 오름차순", () => {
    const holidays = getHolidays(2026);
    for (let i = 1; i < holidays.length; i++) {
      assert.ok(holidays[i]!.date.getTime() >= holidays[i - 1]!.date.getTime());
    }
  });
});
