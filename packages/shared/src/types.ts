import { z } from "zod";

/** 4단 뷰 */
export const ViewKind = z.enum([
  "inbox",
  "today",
  "thisWeek",
  "upcoming",
  "anytime",
  "someday",
  "logbook",
]);
export type ViewKind = z.infer<typeof ViewKind>;

/** 할 일 상태 */
export const TaskStatus = z.enum([
  "open",
  "completed",
  "canceled",
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

/** 반복 규칙 */
export const RecurrenceRule = z.object({
  freq: z.enum(["daily", "weekly", "monthly", "yearly"]),
  interval: z.number().int().positive().default(1),
  /** 주간 반복 시 요일 (0=일요일 ~ 6=토요일) */
  byWeekday: z.array(z.number().int().min(0).max(6)).optional(),
  /** 음력 여부 — 생일·제사·명절 대응 */
  lunar: z.boolean().default(false),
  /** 종료 조건 */
  until: z.string().datetime().optional(),
  count: z.number().int().positive().optional(),
});
export type RecurrenceRule = z.infer<typeof RecurrenceRule>;

/** 영역 (Area) */
export const Area = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(120),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#1C1C1E"),
  icon: z.string().optional(),
  /** 가족·팀 공유 여부 */
  shared: z.boolean().default(false),
  ownerId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Area = z.infer<typeof Area>;

/** 프로젝트 */
export const Project = z.object({
  id: z.string().uuid(),
  areaId: z.string().uuid().nullable(),
  title: z.string().min(1).max(200),
  notes: z.string().max(50_000).optional(),
  deadline: z.string().datetime().nullable(),
  status: TaskStatus.default("open"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Project = z.infer<typeof Project>;

/** 체크리스트 항목 */
export const ChecklistItem = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  done: z.boolean().default(false),
});
export type ChecklistItem = z.infer<typeof ChecklistItem>;

/** 할 일 (Task) */
export const Task = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid().nullable(),
  areaId: z.string().uuid().nullable(),
  title: z.string().min(1).max(500),
  notes: z.string().max(50_000).optional(),
  status: TaskStatus.default("open"),
  /** 예정일 — 이 날짜에 오늘 뷰에 나타남 */
  when: z.string().datetime().nullable(),
  /** 마감일 — 지나면 경고 */
  deadline: z.string().datetime().nullable(),
  /** 종일 여부 */
  allDay: z.boolean().default(true),
  recurrence: RecurrenceRule.nullable(),
  tags: z.array(z.string().min(1).max(32)).default([]),
  checklist: z.array(ChecklistItem).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});
export type Task = z.infer<typeof Task>;

/** Quick Entry 입력 → 파싱 결과 */
export const QuickEntryInput = z.object({
  raw: z.string().min(1).max(2000),
  referenceDate: z.string().datetime().optional(),
  /** 사용자의 시간대. 기본 Asia/Seoul */
  timezone: z.string().default("Asia/Seoul"),
});
export type QuickEntryInput = z.infer<typeof QuickEntryInput>;
