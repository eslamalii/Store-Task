import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product-dto';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    productsController = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(productsController).toBeDefined();
  });

  describe('findAll', () => {
    it('should call productsService.findAll and return result', async () => {
      // Arrange
      const mockProducts = [{ id: 1, name: 'Product A' }];
      mockProductsService.findAll.mockResolvedValue(mockProducts);

      // Act
      const result = await productsController.findAll();

      // Assert
      expect(productsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should call productsService.findOne with the correct id and return it', async () => {
      // Arrange
      const mockProduct = { id: 1, name: 'Product A' };
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      // Act
      const result = await productsController.findOne(1);

      // Assert
      expect(productsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('create', () => {
    it('should call productsService.create with DTO and return the new product', async () => {
      // Arrange
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        description: 'A brand new product',
        price: 100,
        stock: 10,
      };
      const mockCreatedProduct = { id: 1, ...createProductDto };
      mockProductsService.create.mockResolvedValue(mockCreatedProduct);

      // Act
      const result = await productsController.create(createProductDto);

      // Assert
      expect(productsService.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(mockCreatedProduct);
    });
  });

  describe('update', () => {
    it('should call productsService.update with id and DTO, returning updated product', async () => {
      // Arrange
      const updateDto: CreateProductDto = {
        name: 'Updated Product',
        description: 'An updated product description',
        price: 150,
        stock: 5,
      };
      const mockUpdatedProduct = { id: 1, ...updateDto };
      mockProductsService.update.mockResolvedValue(mockUpdatedProduct);

      // Act
      const result = await productsController.update(1, updateDto);

      // Assert
      expect(productsService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockUpdatedProduct);
    });
  });

  describe('remove', () => {
    it('should call productsService.remove with the correct id and return a result', async () => {
      // Arrange
      const mockDeletionResult = { affected: 1 };
      mockProductsService.remove.mockResolvedValue(mockDeletionResult);

      // Act
      const result = await productsController.remove(1);

      // Assert
      expect(productsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDeletionResult);
    });
  });
});
