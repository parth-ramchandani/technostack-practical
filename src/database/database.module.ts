import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "../entities/user.entity";
import { Product } from "../entities/product.entity";
import { ProductVariant } from "../entities/product-variant.entity";
import { RefreshToken } from "../entities/refresh-token.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DATABASE_HOST", "localhost"),
        port: configService.get<number>("DATABASE_PORT", 5432),
        username: configService.get<string>("DATABASE_USERNAME", "postgres"),
        password: configService.get<string>("DATABASE_PASSWORD", "password"),
        database: configService.get<string>("DATABASE_NAME", "product_db"),
        synchronize: configService.get<boolean>("DATABASE_SYNCHRONIZE", true),
        logging: configService.get<boolean>("DATABASE_LOGGING", false),
        entities: [User, Product, ProductVariant, RefreshToken],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
