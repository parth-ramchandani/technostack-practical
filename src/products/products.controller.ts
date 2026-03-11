import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../common/user-role.enum";

@Controller("products")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async createProduct(
    @Body()
    productData: {
      name: string;
      description?: string;
      category?: string;
      variants: Array<{
        sku: string;
        price: number;
        stock: number;
        attributes: Record<string, any>;
      }>;
    },
  ) {
    return this.productsService.createProductWithVariants(productData);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN)
  async updateProduct(
    @Param("id") productId: string,
    @Body()
    productData: {
      name?: string;
      description?: string;
      category?: string;
      variants?: Array<{
        id?: string;
        sku: string;
        price: number;
        stock: number;
        attributes: Record<string, any>;
      }>;
    },
  ) {
    return this.productsService.updateProductWithVariants(
      productId,
      productData,
    );
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  async deleteProduct(@Param("id") productId: string) {
    await this.productsService.softDeleteProduct(productId);
    return { message: "Product deleted successfully" };
  }

  @Get()
  async getProducts(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("category") category?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("attributes") attributes?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const minPriceNum = minPrice ? parseInt(minPrice, 10) : undefined;
    const maxPriceNum = maxPrice ? parseInt(maxPrice, 10) : undefined;
    const parsedAttributes = attributes ? JSON.parse(attributes) : undefined;
    return this.productsService.getProducts(pageNum, limitNum, {
      category,
      minPrice: minPriceNum,
      maxPrice: maxPriceNum,
      attributes: parsedAttributes,
    });
  }

  @Get(":id")
  async getProduct(@Param("id") productId: string) {
    return this.productsService.getProductById(productId);
  }
}
