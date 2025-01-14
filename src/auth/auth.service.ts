import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from './roles.enum';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password, role } = registerUserDto;
    this.logger.info(`Registering user with email: ${email}`);

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      this.logger.warn(
        `Attempted registration with an existing email: ${email}`,
      );

      throw new ConflictException('Email already in use');
    }

    this.logger.debug(`Hashing password for email: ${email}`);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role: role || Role.User,
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.info(`User registered successfully. ID: ${savedUser.id}`);

    return savedUser;
  }

  async validateUser(email: string, password: string): Promise<User> {
    this.logger.debug(`Validating user credentials: ${email}`);
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      this.logger.debug(`Password match for user: ${email}`);
      return user;
    }

    this.logger.warn(`Incorrect password for user: ${email}`);
    return null;
  }

  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const { email, password } = loginUserDto;
    this.logger.info(`Login attempt for email: ${email}`);

    const user = await this.validateUser(email, password);

    if (!user) {
      this.logger.error(`Unauthorized login attempt: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };

    this.logger.info(`User logged in successfully. Email: ${email}`);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
