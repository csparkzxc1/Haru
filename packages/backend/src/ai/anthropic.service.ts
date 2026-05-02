import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Claude API 어댑터.
 *
 *   - 모델: claude-sonnet-4-6 (속도/지능/비용 균형. 대부분의 productivity
 *     UX 에 적합).
 *   - prompt caching: 시스템 프롬프트가 여러 요청에 걸쳐 동일하므로
 *     `cache_control: ephemeral` 로 캐시. 두 번째 호출부터 ~10% 비용.
 *   - thinking: 적응형. complexity-aware. effort 는 high (정확도 우선).
 *   - 키 미설정 시 503 — AI 기능은 부가 기능이므로 다른 요청에 영향 없음.
 */
@Injectable()
export class AnthropicService {
  private readonly logger = new Logger(AnthropicService.name);
  private readonly client: Anthropic | null;
  private readonly model = "claude-sonnet-4-6" as const;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>("ANTHROPIC_API_KEY");
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn(
        "ANTHROPIC_API_KEY 미설정 — AI 기능은 503으로 차단됩니다",
      );
    }
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  private require(): Anthropic {
    if (!this.client) {
      throw new ServiceUnavailableException(
        "AI 어시스턴트는 ANTHROPIC_API_KEY 환경변수가 설정되어야 동작합니다",
      );
    }
    return this.client;
  }

  /**
   * 시스템 프롬프트는 모든 호출에서 동일하므로 캐시 가능. 호출자가 주는
   * `userText` 만 변동된다 → cache_read_input_tokens 가 매 호출 ~ system 의
   * 90% 를 절감.
   */
  async complete(opts: {
    systemPrompt: string;
    userText: string;
    /** JSON-only 응답 강제 시 사용. JSON Schema. */
    jsonSchema?: Record<string, unknown>;
    maxTokens?: number;
  }): Promise<{ text: string; parsed?: unknown }> {
    const client = this.require();

    const response = await client.messages.create({
      model: this.model,
      max_tokens: opts.maxTokens ?? 4096,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        ...(opts.jsonSchema
          ? { format: { type: "json_schema", schema: opts.jsonSchema } }
          : {}),
      },
      system: [
        {
          type: "text",
          text: opts.systemPrompt,
          // 시스템 프롬프트 + tools 가 함께 캐시됨 (현 모듈은 tools 미사용)
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: opts.userText }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    let parsed: unknown;
    if (opts.jsonSchema) {
      try {
        parsed = JSON.parse(text);
      } catch {
        // JSON 형식 오류 — 텍스트만 반환
      }
    }

    this.logger.debug(
      `[ai] tokens in=${response.usage.input_tokens} cache_read=${response.usage.cache_read_input_tokens ?? 0} cache_write=${response.usage.cache_creation_input_tokens ?? 0} out=${response.usage.output_tokens}`,
    );

    return { text, parsed };
  }
}
