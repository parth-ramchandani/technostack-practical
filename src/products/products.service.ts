import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Product } from "../entities/product.entity";
import { ProductVariant } from "../entities/product-variant.entity";
import * as crypto from "crypto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
    private dataSource: DataSource,
  ) {}

  async createProductWithVariants(productData: {
    name: string;
    description?: string;
    category?: string;
    variants: Array<{
      sku: string;
      price: number;
      stock: number;
      attributes: Record<string, any>;
    }>;
  }): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = queryRunner.manager.create(Product, {
        name: productData.name,
        description: productData.description,
        category: productData.category,
      });
      const savedProduct = await queryRunner.manager.save(Product, product);

      const variants = productData.variants.map((variantData) => {
        const attributesHash = crypto
          .createHash("sha256")
          .update(JSON.stringify(variantData.attributes))
          .digest("hex");

        return queryRunner.manager.create(ProductVariant, {
          sku: variantData.sku,
          price: variantData.price,
          stock: variantData.stock,
          attributes: variantData.attributes,
          attributesHash,
          product: savedProduct,
          productId: savedProduct.id,
        });
      });

      await queryRunner.manager.save(ProductVariant, variants);
      await queryRunner.commitTransaction();

      return this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ["variants"],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProductWithVariants(
    productId: string,
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
  ): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: productId },
        relations: ["variants"],
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (productData.name !== undefined) product.name = productData.name;
      if (productData.description !== undefined)
        product.description = productData.description;
      if (productData.category !== undefined)
        product.category = productData.category;

      await queryRunner.manager.save(Product, product);

      if (productData.variants) {
        // Remove existing variants not in the update
        const updatedVariantIds = productData.variants
          .map((v) => v.id)
          .filter((id) => id);

        if (updatedVariantIds.length > 0) {
          await queryRunner.manager.delete(ProductVariant, {
            productId,
            id: updatedVariantIds,
          });
        }

        // Create or update variants
        const variants = productData.variants.map((variantData) => {
          const attributesHash = crypto
            .createHash("sha256")
            .update(JSON.stringify(variantData.attributes))
            .digest("hex");

          return queryRunner.manager.create(ProductVariant, {
            id: variantData.id,
            sku: variantData.sku,
            price: variantData.price,
            stock: variantData.stock,
            attributes: variantData.attributes,
            attributesHash,
            product,
            productId,
          });
        });

        await queryRunner.manager.save(ProductVariant, variants);
      }

      await queryRunner.commitTransaction();

      return this.productRepository.findOne({
        where: { id: productId },
        relations: ["variants"],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async softDeleteProduct(productId: string): Promise<void> {
    await this.productRepository.update(productId, { isDeleted: true });
  }

  async getProducts(
    page: number = 1,
    limit: number = 10,
    filters: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      attributes?: Record<string, any>;
    } = {},
  ): Promise<{ products: Product[]; total: number }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.variants", "variant")
      .where("product.isDeleted = :isDeleted", { isDeleted: false });

    if (filters.category) {
      queryBuilder.andWhere("product.category = :category", {
        category: filters.category,
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      if (filters.minPrice !== undefined) {
        queryBuilder.andWhere("variant.price >= :minPrice", {
          minPrice: filters.minPrice,
        });
      }
      if (filters.maxPrice !== undefined) {
        queryBuilder.andWhere("variant.price <= :maxPrice", {
          maxPrice: filters.maxPrice,
        });
      }
    }

    if (filters.attributes) {
      Object.entries(filters.attributes).forEach(([key, value]) => {
        queryBuilder.andWhere(`variant.attributes ->> :key = :value`, {
          key,
          value,
        });
      });
    }

    const total = await queryBuilder.getCount();
    const products = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { products, total };
  }

  async getProductById(productId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId, isDeleted: false },
      relations: ["variants"],
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }
}
