import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService.register with the correct DTO and return its result', async () => {
      // Arrange
      const dto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      const mockResult = { id: 1, email: dto.email, role: 'user' };
      mockAuthService.register.mockResolvedValue(mockResult);

      // Act
      const result = await authController.register(dto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return an access token', async () => {
      // Arrange
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockTokenResult = { access_token: 'mock-jwt-token' };
      mockAuthService.login.mockResolvedValue(mockTokenResult);

      // Act
      const result = await authController.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockTokenResult);
    });

    it('should throw if AuthService.login throws an error', async () => {
      // Arrange
      const loginDto: LoginUserDto = {
        email: 'fail@example.com',
        password: 'wrong',
      };
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      // Act & Assert
      await expect(authController.login(loginDto)).rejects.toThrowError(
        'Invalid credentials',
      );
    });
  });
});
