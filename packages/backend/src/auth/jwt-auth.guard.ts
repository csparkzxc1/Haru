import {
  ExecutionContext,
  Injectable,
  createParamDecorator,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { AuthenticatedUser } from "./jwt.strategy";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as AuthenticatedUser;
  },
);
