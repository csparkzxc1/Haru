import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { AnthropicService } from "./anthropic.service";

@Module({
  controllers: [AiController],
  providers: [AiService, AnthropicService],
})
export class AiModule {}
