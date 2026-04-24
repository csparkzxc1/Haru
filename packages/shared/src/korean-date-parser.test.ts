import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseKoreanEntry } from "./korean-date-parser";

const REF = new Date(2026, 3, 19, 10, 0, 0); // 2026-04-19(일) 10:00 KST

describe("parseKoreanEntry", () => {
  it("빈 일정 → 원문 유지", () => {
    const r = parseKoreanEntry("우유 사기", { referenceDate: REF });
    assert.equal(r.title, "우유 사기");
    assert.equal(r.when, null);
    assert.equal(r.deadline, null);
  });

  it("내일 + 태그 + 시간", () => {
    const r = parseKoreanEntry("내일 오후 3시 30분 팀 회의 #회의 #외근", { referenceDate: REF });
    assert.equal(r.title, "팀 회의");
    assert.deepEqual(r.tags.sort(), ["외근", "회의"]);
    assert.ok(r.when);
    const d = new Date(r.when!);
    assert.equal(d.getDate(), 20);
    assert.equal(d.getHours(), 15);
    assert.equal(d.getMinutes(), 30);
    assert.equal(r.allDay, false);
  });

  it("다음주 월요일 오전 9시", () => {
    const r = parseKoreanEntry("다음주 월요일 오전 9시 주간보고 제출", { referenceDate: REF });
    assert.match(r.title, /주간보고 제출/);
    const d = new Date(r.when!);
    assert.equal(d.getDay(), 1);
    assert.equal(d.getHours(), 9);
  });

  it("월말까지 마감", () => {
    const r = parseKoreanEntry("월말까지 기획서 작성", { referenceDate: REF });
    assert.ok(r.deadline);
    const d = new Date(r.deadline!);
    assert.equal(d.getMonth(), 3); // 4월
    assert.equal(d.getDate(), 30);
  });

  it("3일 후 치과", () => {
    const r = parseKoreanEntry("3일 후 치과", { referenceDate: REF });
    const d = new Date(r.when!);
    assert.equal(d.getDate(), 22);
  });

  it("크리스마스에 가족 모임", () => {
    const r = parseKoreanEntry("크리스마스에 가족 모임", { referenceDate: REF });
    const d = new Date(r.when!);
    assert.equal(d.getMonth(), 11);
    assert.equal(d.getDate(), 25);
    assert.match(r.title, /가족 모임/);
  });

  it("우선순위 추출", () => {
    const r = parseKoreanEntry("이메일 답장 !!!", { referenceDate: REF });
    assert.equal(r.priority, 3);
    assert.equal(r.title, "이메일 답장");
  });

  it("절대일 4/25", () => {
    const r = parseKoreanEntry("4/25 세무 신고", { referenceDate: REF });
    const d = new Date(r.when!);
    assert.equal(d.getMonth(), 3);
    assert.equal(d.getDate(), 25);
  });

  it("시간만 → 오늘 또는 내일", () => {
    const r = parseKoreanEntry("점심때 스터디카페", { referenceDate: REF });
    assert.ok(r.when);
    const d = new Date(r.when!);
    assert.equal(d.getHours(), 12);
  });

  it("다음달 15일 세금 납부 ~까지", () => {
    const r = parseKoreanEntry("다음달 15일까지 세금 납부", { referenceDate: REF });
    assert.ok(r.deadline);
    const d = new Date(r.deadline!);
    assert.equal(d.getMonth(), 4); // 5월
    assert.equal(d.getDate(), 15);
  });
});
