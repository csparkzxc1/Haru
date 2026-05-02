import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { resolveConflict } from "./sync-conflict.js";

describe("resolveConflict (LWW)", () => {
  it("server null 이면 무조건 apply (신규 생성)", () => {
    assert.equal(
      resolveConflict({
        serverUpdatedAt: null,
        clientUpdatedAt: new Date().toISOString(),
      }),
      "apply",
    );
  });

  it("client 가 server 보다 미래면 apply", () => {
    assert.equal(
      resolveConflict({
        serverUpdatedAt: "2026-05-02T10:00:00.000Z",
        clientUpdatedAt: "2026-05-02T10:00:01.000Z",
      }),
      "apply",
    );
  });

  it("client 가 server 와 같은 시각이면 apply (멱등)", () => {
    const t = "2026-05-02T10:00:00.000Z";
    assert.equal(
      resolveConflict({ serverUpdatedAt: t, clientUpdatedAt: t }),
      "apply",
    );
  });

  it("skew 윈도우 내(기본 5초) 약간 과거여도 apply", () => {
    assert.equal(
      resolveConflict({
        serverUpdatedAt: "2026-05-02T10:00:05.000Z",
        clientUpdatedAt: "2026-05-02T10:00:01.000Z", // 4초 과거
      }),
      "apply",
    );
  });

  it("skew 초과 과거면 ignore", () => {
    assert.equal(
      resolveConflict({
        serverUpdatedAt: "2026-05-02T10:00:10.000Z",
        clientUpdatedAt: "2026-05-02T10:00:00.000Z", // 10초 과거
      }),
      "ignore",
    );
  });

  it("커스텀 skewMs=0 면 정확히 server 시각 이상이어야 apply", () => {
    assert.equal(
      resolveConflict({
        serverUpdatedAt: "2026-05-02T10:00:01.000Z",
        clientUpdatedAt: "2026-05-02T10:00:00.999Z",
        skewMs: 0,
      }),
      "ignore",
    );
    assert.equal(
      resolveConflict({
        serverUpdatedAt: "2026-05-02T10:00:01.000Z",
        clientUpdatedAt: "2026-05-02T10:00:01.000Z",
        skewMs: 0,
      }),
      "apply",
    );
  });

  it("Date 객체와 ISO 문자열을 혼용해도 동일 결과", () => {
    const server = new Date("2026-05-02T10:00:00.000Z");
    const client = new Date("2026-05-02T10:00:01.000Z");
    assert.equal(
      resolveConflict({ serverUpdatedAt: server, clientUpdatedAt: client }),
      resolveConflict({
        serverUpdatedAt: server.toISOString(),
        clientUpdatedAt: client.toISOString(),
      }),
    );
  });

  it("잘못된 날짜 문자열은 안전하게 apply (큐 손실 방지)", () => {
    assert.equal(
      resolveConflict({
        serverUpdatedAt: "not-a-date",
        clientUpdatedAt: new Date().toISOString(),
      }),
      "apply",
    );
  });
});
