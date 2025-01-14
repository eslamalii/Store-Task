import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product-dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.info(`Creating product: ${createProductDto.name}`);

    const newProduct = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(newProduct);

    this.logger.info(`Product created with ID: ${savedProduct.id}`);

    return savedProduct;
  }

  async findAll(): Promise<Product[]> {
    this.logger.debug('Retrieving all products');

    const products = await this.productRepository.find();

    this.logger.debug(`Found ${products.length} products`);

    return products;
  }

  async findOne(id: number): Promise<Product> {
    this.logger.debug(`Looking for product with ID: ${id}`);

    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      this.logger.warn(`Product #${id} not found`);

      throw new NotFoundException(`Product #${id} not found`);
    }

    this.logger.debug(`Product found: ${product.name}`);

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    this.logger.info(`Updating product #${id}`);

    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);

    const updatedProduct = await this.productRepository.save(product);

    this.logger.info(`Product #${id} updated`);

    return updatedProduct;
  }

  async remove(id: number): Promise<void> {
    this.logger.warn(`Removing product #${id}...`);

    const product = await this.findOne(id);

    if (!product) throw new NotFoundException(`Product #${id} not found`);

    await this.productRepository.remove(product);

    this.logger.warn(`Product #${id} removed successfully`);
  }
}
