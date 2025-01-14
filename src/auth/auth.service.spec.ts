import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from './roles.enum';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  // Mock repository
  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  // Mock JWT service
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email already in use', async () => {
      // Arrange
      const registerUserDto: RegisterUserDto = {
        email: 'existing@example.com',
        password: 'somepassword',
      };
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
      });

      // Act & Assert
      await expect(authService.register(registerUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerUserDto.email },
      });
    });

    it('should create and save a new user otherwise', async () => {
      // Arrange
      const registerUserDto: RegisterUserDto = {
        email: 'new@example.com',
        password: 'somepassword',
        role: Role.Admin,
      };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        email: registerUserDto.email,
        password: 'hashedpassword',
        role: Role.Admin,
      });
      mockUserRepository.save.mockResolvedValue({
        id: 1,
        email: registerUserDto.email,
        password: 'hashedpassword',
        role: Role.Admin,
      });

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashedpassword');

      // Act
      const result = await authService.register(registerUserDto);

      // Assert
      expect(result).toEqual({
        id: 1,
        email: registerUserDto.email,
        password: 'hashedpassword',
        role: Role.Admin,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerUserDto.email,
        password: 'hashedpassword',
        role: Role.Admin,
      });
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await authService.validateUser(
        'test@example.com',
        'password',
      );

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: ['id', 'email', 'password', 'role'],
      });
    });

    it('should return null if passwords do not match', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        role: Role.User,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      // Act
      const result = await authService.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should return user if password matches', async () => {
      // Arrange
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        role: Role.User,
      };
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      // Act
      const result = await authService.validateUser(
        'test@example.com',
        'correctpassword',
      );

      // Assert
      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if validateUser returns null', async () => {
      // Arrange
      const loginUserDto: LoginUserDto = {
        email: 'unknown@example.com',
        password: 'wrongpassword',
      };
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return an access token if user is valid', async () => {
      // Arrange
      const loginUserDto: LoginUserDto = {
        email: 'valid@example.com',
        password: 'correctpassword',
      };
      const mockUser = {
        id: 1,
        email: 'valid@example.com',
        password: 'hashedpassword',
        role: Role.User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('test-jwt-token');

      // Act
      const result = await authService.login(loginUserDto);

      // Assert
      expect(result).toEqual({ access_token: 'test-jwt-token' });
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginUserDto.email,
        loginUserDto.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });
  });
});
