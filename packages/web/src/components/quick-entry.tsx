"use client";
import { useState } from "react";
import { parseKoreanEntry } from "@haru/shared/korean-date";

export function QuickEntry() {
  const [value, setValue] = useState("");
  const preview = value.trim() ? parseKoreanEntry(value) : null;

  return (
    <div className="mb-8">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='무엇을 하실 건가요?  예: "내일 오후 3시 팀 회의 #회의 !"'
          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-[15px] outline-none focus:border-haru-accent transition-colors"
        />
      </div>
      {preview && (
        <div className="mt-2 px-4 py-2 text-xs text-haru-muted bg-black/[.02] dark:bg-white/[.03] rounded-lg flex flex-wrap gap-3">
          <span>📝 {preview.title}</span>
          {preview.when && <span>📅 {new Date(preview.when).toLocaleString("ko-KR")}</span>}
          {preview.deadline && <span>⏰ 마감: {new Date(preview.deadline).toLocaleString("ko-KR")}</span>}
          {preview.priority > 0 && <span>❗{"!".repeat(preview.priority)}</span>}
          {preview.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
