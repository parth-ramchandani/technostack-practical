import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { Product } from "./product.entity";

@Entity("product_variants")
@Unique(["product", "attributesHash"])
export class ProductVariant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: "simple-json" })
  attributes: Record<string, any>;

  @Column()
  attributesHash: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product: Product;

  @Column()
  productId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
