"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { parseKoreanEntry } from "@haru/shared/korean-date";
import { useQuickCreate } from "@/lib/hooks";

export function QuickEntry() {
  const [value, setValue] = useState("");
  const create = useQuickCreate();
  const preview = value.trim() ? parseKoreanEntry(value) : null;

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const raw = value.trim();
    if (!raw || create.isPending) return;
    create.mutate(raw, {
      onSuccess: () => setValue(""),
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) submit();
  }

  return (
    <form onSubmit={submit} className="mb-8">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={create.isPending}
          placeholder='무엇을 하실 건가요?  예: "내일 오후 3시 팀 회의 #회의 !"'
          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-[15px] outline-none focus:border-haru-accent transition-colors disabled:opacity-50"
        />
      </div>
      {preview && (
        <div className="mt-2 px-4 py-2 text-xs text-haru-muted bg-black/[.02] dark:bg-white/[.03] rounded-lg flex flex-wrap gap-3">
          <span>📝 {preview.title}</span>
          {preview.when && (
            <span>📅 {new Date(preview.when).toLocaleString("ko-KR")}</span>
          )}
          {preview.deadline && (
            <span>⏰ 마감: {new Date(preview.deadline).toLocaleString("ko-KR")}</span>
          )}
          {preview.priority > 0 && <span>❗{"!".repeat(preview.priority)}</span>}
          {preview.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
          <span className="ml-auto text-haru-muted/70">⏎ 추가</span>
        </div>
      )}
      {create.error && (
        <div className="mt-2 text-xs text-red-500">
          저장 실패: {(create.error as Error).message}
        </div>
      )}
    </form>
  );
}
