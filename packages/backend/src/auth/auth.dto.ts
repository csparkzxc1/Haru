import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsString() @MinLength(1) nickname!: string;
  @IsBoolean() privacyAgreed!: boolean;
  @IsBoolean() termsAgreed!: boolean;
  @IsOptional() @IsBoolean() marketingOptIn?: boolean;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(1) password!: string;
}

export class RefreshDto {
  @IsString() refreshToken!: string;
}
