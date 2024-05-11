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
import { AccessTokenPayload } from '../interfaces/access-token.payload.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private hashingService: HashingService,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private usersService: UsersService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<string> {
    const existedUser = await this.usersService.findByEmail(signUpDto.email);
    if (existedUser) {
      throw new ConflictException('User already exists');
    }
    const user = new User();
    user.email = signUpDto.email;
    user.password = await this.hashingService.hash(signUpDto.password);
    await this.usersService.create(user);
    const accessToken = await this.generateAccessToken(user);
    return accessToken;
  }

  async signIn(signInDto: SignInDto): Promise<string> {
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
    const accessToken = await this.generateAccessToken(user);
    return accessToken;
  }

  async verifyToken<Payload extends object>(token: string): Promise<Payload> {
    try {
      return await this.jwtService.verifyAsync<Payload>(token, {
        secret: this.jwtConfiguration.secret,
      });
    } catch (_e) {
      throw new UnauthorizedException('User is not logged in');
    }
  }

  private async generateAccessToken(user: User): Promise<string> {
    const accessToken = await this.signToken<AccessTokenPayload>(
      user.id,
      this.jwtConfiguration.accessTokenTtl,
      { email: user.email },
    );
    return accessToken;
  }

  private async signToken<Payload>(
    userId: string,
    expiresIn: number,
    data?: Omit<Payload, 'sub'>,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      {
        ...(data ?? {}),
        sub: userId,
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
