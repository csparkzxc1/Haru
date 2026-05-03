import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { t, resolveLocale, DEFAULT_LOCALE } from "./i18n.js";

describe("i18n", () => {
  it("ko/ja 모두 한국어 키로 lookup", () => {
    assert.equal(t("today", "ko"), "오늘");
    assert.equal(t("today", "ja"), "今日");
    assert.equal(t("settings.colorMode.dark", "ko"), "다크");
    assert.equal(t("settings.colorMode.dark", "ja"), "ダーク");
  });

  it("로케일 미지정 시 default(ko)", () => {
    assert.equal(t("today"), "오늘");
  });

  it("resolveLocale — BCP 47 변형 처리", () => {
    assert.equal(resolveLocale("ko"), "ko");
    assert.equal(resolveLocale("ko-KR"), "ko");
    assert.equal(resolveLocale("ko_KR"), "ko");
    assert.equal(resolveLocale("ja"), "ja");
    assert.equal(resolveLocale("ja-JP"), "ja");
    assert.equal(resolveLocale("JA-JP"), "ja");
  });

  it("resolveLocale — 미지원 로케일은 default", () => {
    assert.equal(resolveLocale("en-US"), DEFAULT_LOCALE);
    assert.equal(resolveLocale(null), DEFAULT_LOCALE);
    assert.equal(resolveLocale(""), DEFAULT_LOCALE);
    assert.equal(resolveLocale(undefined), DEFAULT_LOCALE);
  });
});
