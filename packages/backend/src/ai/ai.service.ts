import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AnthropicService } from "./anthropic.service";

/**
 * AI 어시스턴트 — 3가지 핵심 기능
 *   1) organizeToday()      — 오늘 할 일 자동 분류·우선순위
 *   2) generateWeeklyReview()— 지난 주 완료/미완료 기반 회고
 *   3) decomposeProject()   — 큰 task 를 sub-task 로 분해
 *
 * 시스템 프롬프트는 호출별로 동일 — Anthropic.complete() 가 cache_control 을
 * 자동 적용하므로 두 번째 요청부터 ~10% 비용으로 응답.
 */
@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly anthropic: AnthropicService,
  ) {}

  // ---------------- 오늘 정리 ----------------

  private static readonly ORGANIZE_SYSTEM = `당신은 한국 직장인의 To-Do 비서 "하루"입니다.
사용자의 오늘 할 일 목록을 받아 한국 직장 문화에 맞게 정렬하고 분류합니다.

분류 원칙:
- "DEEP_WORK" : 30분 이상 집중이 필요한 일 (보고서, 코딩, 분석 등)
- "QUICK_WIN"  : 15분 이내에 끝낼 수 있는 일 (전화, 답변, 짧은 검토)
- "MEETING"    : 회의·통화·미팅
- "ERRAND"     : 외근·심부름·은행·우체국 등
- "PERSONAL"   : 개인·가족 관련 일

우선순위 원칙 (중요-긴급 매트릭스):
1. 마감이 오늘인 할 일은 가장 위
2. DEEP_WORK 는 오전에 배치 (한국 직장 평균 집중도 기준)
3. MEETING 은 정시 인근에 고정
4. QUICK_WIN 은 점심 직전·퇴근 직전 자투리 시간에 배치
5. ERRAND 는 점심시간 또는 오후 막바지로

결과는 반드시 JSON 으로만 응답하세요. 잡담·서론·설명 금지.`;

  private static readonly ORGANIZE_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
      morning: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            kind: {
              type: "string",
              enum: ["DEEP_WORK", "QUICK_WIN", "MEETING", "ERRAND", "PERSONAL"],
            },
            reason: { type: "string" },
          },
          required: ["id", "title", "kind", "reason"],
        },
      },
      afternoon: { $ref: "#/properties/morning" },
      evening: { $ref: "#/properties/morning" },
      summary: { type: "string" },
    },
    required: ["morning", "afternoon", "evening", "summary"],
  };

  async organizeToday(userId: string) {
    const start = startOfDay();
    const end = addDays(start, 1);
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: userId,
        deletedAt: null,
        status: "OPEN",
        OR: [
          { when: { gte: start, lt: end } },
          { deadline: { gte: start, lt: end } },
        ],
      },
      select: {
        id: true,
        title: true,
        notes: true,
        when: true,
        deadline: true,
      },
    });

    if (tasks.length === 0) {
      return {
        morning: [],
        afternoon: [],
        evening: [],
        summary: "오늘 예정된 할 일이 없습니다.",
      };
    }

    const userText = `오늘은 ${formatKoreanDate(new Date())}입니다.

다음 할 일을 분류·정렬해 주세요:
${JSON.stringify(tasks, null, 2)}`;

    const result = await this.anthropic.complete({
      systemPrompt: AiService.ORGANIZE_SYSTEM,
      userText,
      jsonSchema: AiService.ORGANIZE_SCHEMA,
      maxTokens: 4096,
    });
    return result.parsed ?? { raw: result.text };
  }

  // ---------------- 주간 회고 ----------------

  private static readonly REVIEW_SYSTEM = `당신은 한국 직장인의 1주일 회고를 도와주는 코치입니다.
완료한 할 일과 놓친 할 일을 받아 다음 형식으로 회고를 작성합니다.

스타일:
- 칭찬 먼저, 그 다음 개선점 (한국 정서)
- 존댓말 (해요체)
- 구체적인 습관 제안 1~2개로 끝맺음
- 각 섹션 2~4문장. 장황하지 않게.

결과는 한국어 마크다운 텍스트.`;

  async generateWeeklyReview(userId: string) {
    const end = new Date();
    const start = addDays(end, -7);

    const [completed, missed] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          ownerId: userId,
          status: "COMPLETED",
          completedAt: { gte: start, lte: end },
        },
        select: { title: true, completedAt: true },
        orderBy: { completedAt: "asc" },
        take: 100,
      }),
      this.prisma.task.findMany({
        where: {
          ownerId: userId,
          status: "OPEN",
          deletedAt: null,
          when: { gte: start, lte: end },
        },
        select: { title: true, when: true },
        take: 100,
      }),
    ]);

    const userText = `기간: ${formatKoreanDate(start)} ~ ${formatKoreanDate(end)}

완료한 할 일 (${completed.length}건):
${completed.map((t) => `- [${formatKoreanDate(t.completedAt!)}] ${t.title}`).join("\n") || "(없음)"}

놓친 할 일 (${missed.length}건):
${missed.map((t) => `- [${formatKoreanDate(t.when!)}] ${t.title}`).join("\n") || "(없음)"}

이 데이터를 토대로 다음 섹션을 포함한 회고를 작성해 주세요:
1. 잘한 점
2. 아쉬운 점
3. 다음 주 다짐 (1~2개의 구체적 습관)`;

    const result = await this.anthropic.complete({
      systemPrompt: AiService.REVIEW_SYSTEM,
      userText,
      maxTokens: 2048,
    });
    return {
      period: { start: start.toISOString(), end: end.toISOString() },
      counts: { completed: completed.length, missed: missed.length },
      markdown: result.text,
    };
  }

  // ---------------- 프로젝트 분해 ----------------

  private static readonly DECOMPOSE_SYSTEM = `당신은 큰 목표를 작은 실행 단위로 쪼개는 전문가입니다.
사용자가 한 줄로 적은 큰 할 일·프로젝트를 받아, 다음 규칙으로 분해합니다.

규칙:
- 각 sub-task 는 명사가 아닌 "동사로 시작하는 한 줄 행동"
- 최대 7개. 5개 이내가 이상적.
- 의존 관계가 명확하면 순서대로 나열
- 각 항목 옆에 예상 소요 시간 (15분 단위, 최대 4시간)
- 한국 직장 문화 고려 — "팀 회의", "보고", "리뷰" 등 자연스러운 한국어

결과는 JSON only.`;

  private static readonly DECOMPOSE_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
      projectTitle: { type: "string" },
      tasks: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            estimateMinutes: { type: "integer" },
            dependsOn: {
              type: "array",
              items: { type: "integer" },
              description: "이 항목이 의존하는 다른 항목의 0-based index",
            },
          },
          required: ["title", "estimateMinutes"],
        },
      },
    },
    required: ["projectTitle", "tasks"],
  };

  async decomposeProject(userId: string, raw: string) {
    void userId; // 향후 사용자별 컨텍스트(직무, 프로젝트 히스토리)에 활용 예정
    const result = await this.anthropic.complete({
      systemPrompt: AiService.DECOMPOSE_SYSTEM,
      userText: `다음 큰 일을 분해해 주세요:\n\n"${raw}"`,
      jsonSchema: AiService.DECOMPOSE_SCHEMA,
      maxTokens: 2048,
    });
    return result.parsed ?? { raw: result.text };
  }
}

function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function formatKoreanDate(d: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(d);
}
