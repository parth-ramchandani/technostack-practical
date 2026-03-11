import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../entities/user.entity";
import { RefreshToken } from "../entities/refresh-token.entity";
import { UserRole } from "../common/user-role.enum";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(
    email: string,
    password: string,
    role: UserRole = UserRole.USER,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
    });
    return this.userRepository.save(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(
        "JWT_ACCESS_TOKEN_EXPIRY",
        "15m",
      ),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(
        "JWT_REFRESH_TOKEN_EXPIRY",
        "7d",
      ),
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.save({
      token: hashedRefreshToken,
      user,
      userId: user.id,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    // Find all refresh tokens and compare
    const refreshTokenEntities = await this.refreshTokenRepository.find({
      relations: ["user"],
    });

    let validToken = null;
    for (const entity of refreshTokenEntities) {
      if (await bcrypt.compare(token, entity.token)) {
        if (entity.expiresAt < new Date()) {
          throw new Error("Refresh token expired");
        }
        validToken = entity;
        break;
      }
    }

    if (!validToken) {
      throw new Error("Invalid refresh token");
    }

    const user = validToken.user;
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(
        "JWT_ACCESS_TOKEN_EXPIRY",
        "15m",
      ),
    });

    return { accessToken };
  }

  async logout(token: string): Promise<void> {
    // Find and delete the matching refresh token
    const refreshTokenEntities = await this.refreshTokenRepository.find();

    for (const entity of refreshTokenEntities) {
      if (await bcrypt.compare(token, entity.token)) {
        await this.refreshTokenRepository.delete(entity.id);
        return;
      }
    }
  }
}
