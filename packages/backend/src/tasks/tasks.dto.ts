import { IsOptional, IsString, IsArray, IsBoolean, IsIn, IsDateString, IsUUID, IsInt, Min } from "class-validator";

export class CreateTaskDto {
  @IsString() title!: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsUUID() areaId?: string;
  @IsOptional() @IsDateString() when?: string;
  @IsOptional() @IsDateString() deadline?: string;
  @IsOptional() @IsBoolean() allDay?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) checklist?: string[];
}

export class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsDateString() when?: string;
  @IsOptional() @IsDateString() deadline?: string;
  @IsOptional() @IsBoolean() allDay?: boolean;
  @IsOptional() @IsIn(["OPEN", "COMPLETED", "CANCELED"]) status?: "OPEN" | "COMPLETED" | "CANCELED";
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsUUID() areaId?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class ListTasksQuery {
  @IsOptional() @IsIn(["inbox", "today", "thisWeek", "upcoming", "anytime", "someday", "logbook"])
  view?: "inbox" | "today" | "thisWeek" | "upcoming" | "anytime" | "someday" | "logbook";
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsUUID() areaId?: string;
  @IsOptional() @IsInt() @Min(1) limit?: number;
}
