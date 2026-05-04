import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

const KINDS = [
  "WEDDING",
  "FUNERAL",
  "BIRTHDAY",
  "ANNIVERSARY",
  "BABY_100D",
  "BABY_DOL",
  "HOUSEWARMING",
  "PROMOTION",
  "OTHER",
] as const;
export type FamilyEventKind = (typeof KINDS)[number];

export class CreateFamilyEventDto {
  @IsEnum(KINDS) kind!: FamilyEventKind;
  @IsString() personLabel!: string;
  @IsOptional() @IsString() relation?: string;
  @IsDateString() date!: string;
  @IsOptional() @IsString() venue?: string;
  @IsOptional() @IsInt() @Min(0) amountKrw?: number;
  @IsOptional() @IsInt() @Min(0) receivedKrw?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsBoolean() attended?: boolean;
}

export class UpdateFamilyEventDto {
  @IsOptional() @IsEnum(KINDS) kind?: FamilyEventKind;
  @IsOptional() @IsString() personLabel?: string;
  @IsOptional() @IsString() relation?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() venue?: string;
  @IsOptional() @IsInt() @Min(0) amountKrw?: number;
  @IsOptional() @IsInt() @Min(0) receivedKrw?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsBoolean() attended?: boolean;
}
