import { IsOptional, IsString, IsBoolean, IsHexColor, IsInt, Min } from "class-validator";

export class CreateAreaDto {
  @IsString() title!: string;
  @IsOptional() @IsHexColor() colorHex?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsBoolean() shared?: boolean;
}

export class UpdateAreaDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsHexColor() colorHex?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsBoolean() shared?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
