import { Module } from "@nestjs/common";
import { QuickEntryController } from "./quick-entry.controller";
import { TasksModule } from "../tasks/tasks.module";

@Module({
  imports: [TasksModule],
  controllers: [QuickEntryController],
})
export class QuickEntryModule {}
