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
  ],
  controllers: [HealthController],
})
export class AppModule {}
