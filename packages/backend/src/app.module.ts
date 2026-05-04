import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health.controller";
import { AuthModule } from "./auth/auth.module";
import { TasksModule } from "./tasks/tasks.module";
import { AreasModule } from "./areas/areas.module";
import { ProjectsModule } from "./projects/projects.module";
import { QuickEntryModule } from "./quick-entry/quick-entry.module";
import { CalendarModule } from "./calendar/calendar.module";
import { SyncModule } from "./sync/sync.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { FamilyEventsModule } from "./family-events/family-events.module";
import { WidgetsModule } from "./widgets/widgets.module";
import { DataPortabilityModule } from "./data-portability/data-portability.module";
import { AiModule } from "./ai/ai.module";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { ApiKeysModule } from "./api-keys/api-keys.module";
import { WatchModule } from "./watch/watch.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TasksModule,
    AreasModule,
    ProjectsModule,
    QuickEntryModule,
    CalendarModule,
    SyncModule,
    NotificationsModule,
    FamilyEventsModule,
    WidgetsModule,
    DataPortabilityModule,
    AiModule,
    WorkspacesModule,
    ApiKeysModule,
    WatchModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
