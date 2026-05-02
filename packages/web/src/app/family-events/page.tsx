"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiFamilyEvent, type FamilyEventKind } from "@/lib/api";

const KIND_LABEL: Record<FamilyEventKind, string> = {
  WEDDING: "결혼",
  FUNERAL: "장례",
  BIRTHDAY: "생일",
  ANNIVERSARY: "기념일",
  BABY_100D: "백일",
  BABY_DOL: "돌",
  HOUSEWARMING: "집들이",
  PROMOTION: "승진",
  OTHER: "기타",
};

const KINDS: FamilyEventKind[] = [
  "WEDDING",
  "FUNERAL",
  "BIRTHDAY",
  "ANNIVERSARY",
  "BABY_100D",
  "BABY_DOL",
  "HOUSEWARMING",
  "PROMOTION",
  "OTHER",
];

export default function FamilyEventsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const qc = useQueryClient();
  const events = useQuery({
    queryKey: ["family-events", year],
    queryFn: () => api.familyEvents.list(year),
  });
  const stats = useQuery({
    queryKey: ["family-events-stats", year],
    queryFn: () => api.familyEvents.stats(year),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.familyEvents.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["family-events", year] });
      qc.invalidateQueries({ queryKey: ["family-events-stats", year] });
    },
  });

  return (
    <>
      <header className="mb-6 flex items-end gap-3">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">경조사·축의금</h1>
          <p className="text-sm text-haru-muted mt-1">
            관계·날짜·금액을 한 곳에. 연말 정산용 합계도 자동.
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="px-2 py-1 rounded border border-black/10 dark:border-white/15"
          >
            ◀
          </button>
          <span className="px-3 py-1 text-sm">{year}년</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="px-2 py-1 rounded border border-black/10 dark:border-white/15"
          >
            ▶
          </button>
        </div>
      </header>

      {stats.data && (
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <Stat label="보냄" value={stats.data.sent} />
          <Stat label="받음" value={stats.data.received} />
          <Stat label="순지출" value={stats.data.net} accent />
        </div>
      )}

      <NewEventForm
        year={year}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ["family-events", year] });
          qc.invalidateQueries({ queryKey: ["family-events-stats", year] });
        }}
      />

      {events.isLoading ? (
        <div className="text-sm text-haru-muted py-8 text-center">불러오는 중…</div>
      ) : (
        <ul className="divide-y divide-black/5 dark:divide-white/10 mt-2">
          {(events.data ?? []).map((e) => (
            <EventRow key={e.id} event={e} onRemove={() => remove.mutate(e.id)} />
          ))}
        </ul>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 p-3">
      <div className="text-xs text-haru-muted">{label}</div>
      <div className={`text-xl font-semibold mt-1 ${accent ? "text-haru-accent" : ""}`}>
        {value.toLocaleString("ko-KR")}원
      </div>
    </div>
  );
}

function EventRow({
  event,
  onRemove,
}: {
  event: ApiFamilyEvent;
  onRemove: () => void;
}) {
  const date = new Date(event.date);
  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        month: "short",
        day: "numeric",
        weekday: "short",
      }).format(date),
    [date],
  );

  return (
    <li className="py-3 flex items-start gap-3">
      <div className="text-xs text-haru-muted w-16 mt-1 flex-shrink-0">
        {dateLabel}
      </div>
      <div className="flex-1">
        <div className="font-medium">
          {KIND_LABEL[event.kind]} · {event.personLabel}
          {event.relation && (
            <span className="text-haru-muted text-sm ml-2">({event.relation})</span>
          )}
        </div>
        <div className="text-xs text-haru-muted mt-0.5 flex flex-wrap gap-2">
          {event.amountKrw !== null && event.amountKrw !== undefined && (
            <span>보냄 {event.amountKrw.toLocaleString("ko-KR")}원</span>
          )}
          {event.receivedKrw !== null && event.receivedKrw !== undefined && event.receivedKrw > 0 && (
            <span>받음 {event.receivedKrw.toLocaleString("ko-KR")}원</span>
          )}
          {event.venue && <span>📍 {event.venue}</span>}
          {event.attended === true && <span>· 참석</span>}
          {event.attended === false && <span>· 불참</span>}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-xs text-haru-muted hover:text-red-500 px-2"
      >
        삭제
      </button>
    </li>
  );
}

function NewEventForm({
  year,
  onCreated,
}: {
  year: number;
  onCreated: () => void;
}) {
  const [kind, setKind] = useState<FamilyEventKind>("WEDDING");
  const [personLabel, setPersonLabel] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api.familyEvents.create({
        kind,
        personLabel: personLabel.trim(),
        date: new Date(date).toISOString(),
        amountKrw: amount ? parseInt(amount, 10) : undefined,
      }),
    onSuccess: () => {
      setPersonLabel("");
      setDate("");
      setAmount("");
      onCreated();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!personLabel.trim() || !date) return;
        create.mutate();
      }}
      className="grid grid-cols-12 gap-2 mb-4"
    >
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as FamilyEventKind)}
        className="col-span-3 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-2 py-2 text-sm"
      >
        {KINDS.map((k) => (
          <option key={k} value={k}>
            {KIND_LABEL[k]}
          </option>
        ))}
      </select>
      <input
        value={personLabel}
        onChange={(e) => setPersonLabel(e.target.value)}
        placeholder="대상 (예: 김부장 자녀)"
        className="col-span-4 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        min={`${year}-01-01`}
        max={`${year}-12-31`}
        className="col-span-3 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-2 py-2 text-sm"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
        placeholder="금액"
        inputMode="numeric"
        className="col-span-2 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-2 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={create.isPending || !personLabel.trim() || !date}
        className="col-span-12 rounded-md bg-haru-accent text-white py-2 text-sm font-medium disabled:opacity-50"
      >
        추가
      </button>
    </form>
  );
}
