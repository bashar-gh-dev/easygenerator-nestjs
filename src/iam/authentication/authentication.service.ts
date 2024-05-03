import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private hashingService: HashingService,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private usersService: UsersService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const existedUser = await this.usersService.findByEmail(signUpDto.email);
    if (existedUser) {
      throw new ConflictException('User already exists');
    }
    const user = new User();
    user.email = signUpDto.email;
    user.password = await this.hashingService.hash(signUpDto.password);
    await this.usersService.create(user);
    const accessToken = await this.generateTokens(user);
    return accessToken;
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findByEmail(signInDto.email);
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException('Wrong password');
    }
    const accessToken = await this.generateTokens(user);
    return accessToken;
  }

  async verifyToken(token: string) {
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
      });
      return true;
    } catch (_e) {
      throw new UnauthorizedException('User is not logged in');
    }
  }

  private async generateTokens(user: User) {
    const accessToken = await this.signToken<Partial<User>>(
      user.id,
      this.jwtConfiguration.accessTokenTtl,
      { email: user.email },
    );
    return accessToken;
  }

  private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
