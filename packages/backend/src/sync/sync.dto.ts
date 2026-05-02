import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * 단일 Task 변형(operation). 클라이언트는 오프라인 동안 누적한 변경을
 * 일괄로 push 한다. id 는 항상 클라이언트가 생성한 UUID.
 */
export class TaskOpDto {
  @IsIn(["create", "update", "complete", "uncomplete", "delete"])
  op!: "create" | "update" | "complete" | "uncomplete" | "delete";

  @IsUUID()
  id!: string;

  /** 클라이언트가 변형을 만든 시각. 동시 충돌 시 LWW 판정 기준. */
  @IsDateString()
  clientUpdatedAt!: string;

  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsDateString() when?: string | null;
  @IsOptional() @IsDateString() deadline?: string | null;
  @IsOptional() @IsBoolean() allDay?: boolean;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsUUID() areaId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class PushDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskOpDto)
  ops!: TaskOpDto[];
}
