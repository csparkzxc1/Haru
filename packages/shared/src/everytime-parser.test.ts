import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { parseEverytime } from "./everytime-parser.js";

describe("parseEverytime", () => {
  it("행별 형식 — 강의 1개 + 슬롯 2개", () => {
    const text = `자료구조 IF103 김교수
월 09:00-10:30
수 09:00-10:30`;
    const result = parseEverytime(text);
    assert.equal(result.length, 1);
    assert.equal(result[0]!.title, "자료구조");
    assert.equal(result[0]!.code, "IF103");
    assert.equal(result[0]!.professor, "김교수");
    assert.equal(result[0]!.slots.length, 2);
    assert.deepEqual(result[0]!.slots[0], {
      weekday: 1,
      startTime: "09:00",
      endTime: "10:30",
    });
    assert.equal(result[0]!.slots[1]!.weekday, 3);
  });

  it("행별 형식 — '---' 구분으로 다수 강의", () => {
    const text = `자료구조 IF103
월 09:00-10:30
---
운영체제 IF205
화 13:00-14:30
목 13:00-14:30`;
    const result = parseEverytime(text);
    assert.equal(result.length, 2);
    assert.equal(result[1]!.title, "운영체제");
    assert.equal(result[1]!.slots.length, 2);
  });

  it("슬래시 형식 — '월수' 같은 연속 요일 분해", () => {
    const result = parseEverytime("자료구조 / 월수 09:00-10:30 / 김교수");
    assert.equal(result.length, 1);
    assert.equal(result[0]!.slots.length, 2);
    assert.deepEqual(
      result[0]!.slots.map((s) => s.weekday).sort(),
      [1, 3],
    );
  });

  it("슬래시 형식 — 쉼표로 다른 시간대 슬롯", () => {
    const result = parseEverytime(
      "캡스톤 / 월 09:00-10:30, 금 13:00-15:00 / 박교수",
    );
    assert.equal(result.length, 1);
    assert.equal(result[0]!.slots.length, 2);
    assert.equal(result[0]!.slots[0]!.startTime, "09:00");
    assert.equal(result[0]!.slots[1]!.startTime, "13:00");
  });

  it("강의실 정보 추출", () => {
    const result = parseEverytime(`알고리즘
화 10:00-11:30 공학관401`);
    assert.equal(result[0]!.location, "공학관401");
  });

  it("빈 입력 / 인식 불가능한 줄은 무시", () => {
    assert.deepEqual(parseEverytime(""), []);
    assert.deepEqual(parseEverytime("   "), []);
    // 시간 정보가 없으면 강의가 아예 만들어지지 않음
    assert.deepEqual(parseEverytime("그냥 텍스트"), []);
  });

  it("dash 변형 (~ 또는 –) 도 인식", () => {
    const a = parseEverytime("수업\n월 09:00~10:30");
    const b = parseEverytime("수업\n월 09:00–10:30");
    assert.equal(a[0]!.slots[0]!.endTime, "10:30");
    assert.equal(b[0]!.slots[0]!.endTime, "10:30");
  });

  it("한자리 시간도 zero-pad", () => {
    const result = parseEverytime("실습\n월 9:00-10:30");
    assert.equal(result[0]!.slots[0]!.startTime, "09:00");
  });
});
