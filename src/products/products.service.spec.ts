import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product-dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<Repository<Product>>;

  const mockProductRepo: Partial<jest.Mocked<Repository<Product>>> = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(getRepositoryToken(Product)) as jest.Mocked<
      Repository<Product>
    >;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a product', async () => {
      const createDto: CreateProductDto = {
        name: 'Test Product',
        price: 9.99,
        description: 'A test product',
        stock: 10,
      };
      const createdEntity = { id: 1, ...createDto } as Product;
      repository.create.mockReturnValue(createdEntity);
      repository.save.mockResolvedValue(createdEntity);

      const result = await service.create(createDto);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(createdEntity);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: 1, name: 'P1', price: 10, stock: 5 },
        { id: 2, name: 'P2', price: 20, stock: 3 },
      ] as Product[];
      repository.find.mockResolvedValue(mockProducts);

      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const mockProduct = { id: 1, name: 'P1', price: 10, stock: 5 } as Product;
      repository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product if found', async () => {
      const existing: Product = {
        id: 1,
        name: 'Old P',
        description: 'Old description',
        price: 50,
        stock: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.findOne.mockResolvedValue(existing);

      const updateDto: UpdateProductDto = {
        name: 'New P',
        price: 100,
      };

      repository.save.mockImplementation(async (prod: Product) => prod);

      const result = await service.update(1, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalledWith({
        ...existing,
        name: 'New P',
        price: 100,
        stock: 2,
      });
      expect(result).toEqual({
        id: 1,
        name: 'New P',
        description: 'Old description',
        price: 100,
        stock: 2,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
      });
    });

    it('should throw if product not found', async () => {
      repository.findOne.mockResolvedValue(null);
      const updateDto: UpdateProductDto = { price: 100 };
      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an existing product', async () => {
      const product = {
        id: 1,
        name: 'RemoveMe',
        price: 10,
        stock: 5,
      } as Product;
      repository.findOne.mockResolvedValue(product);

      await service.remove(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(product);
    });

    it('should throw if product not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
