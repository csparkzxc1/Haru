import { Body, Controller, Delete, Post, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { RegisterDeviceDto, UnregisterDeviceDto } from "./notifications.dto";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post("devices")
  register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.service.registerDevice(
      user.id,
      dto.token,
      dto.platform ?? "expo",
      dto.deviceLabel,
    );
  }

  @Delete("devices")
  unregister(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UnregisterDeviceDto,
  ) {
    return this.service.unregisterDevice(user.id, dto.token);
  }
}
