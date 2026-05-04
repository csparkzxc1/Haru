import { IsIn, IsOptional, IsString } from "class-validator";

export class RegisterDeviceDto {
  /** Expo Push Token. v1은 expo-notifications 만 지원. */
  @IsString()
  token!: string;

  @IsOptional()
  @IsIn(["expo", "fcm", "apns"])
  platform?: "expo" | "fcm" | "apns";

  @IsOptional()
  @IsString()
  deviceLabel?: string;
}

export class UnregisterDeviceDto {
  @IsString()
  token!: string;
}
