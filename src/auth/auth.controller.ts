import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";
import { UserRole } from "../common/user-role.enum";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(
    @Body() body: { email: string; password: string; role?: UserRole },
  ) {
    return this.authService.register(body.email, body.password, body.role);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post("refresh")
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post("logout")
  async logout(@Body() body: { refreshToken: string }) {
    return this.authService.logout(body.refreshToken);
  }
}
