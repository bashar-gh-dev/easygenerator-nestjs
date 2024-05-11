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
import { RefreshTokenPayload } from '../interfaces/refresh-token.payload.interface';
import { RefreshTokenStorageService } from '../refresh-token-storage.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private hashingService: HashingService,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private usersService: UsersService,
    private refreshTokenStorageService: RefreshTokenStorageService,
  ) {}

  async signUp(
    signUpDto: SignUpDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const existedUser = await this.usersService.findByEmail(signUpDto.email);
    if (existedUser) {
      throw new ConflictException('User already exists');
    }
    const user = new User();
    user.email = signUpDto.email;
    user.password = await this.hashingService.hash(signUpDto.password);
    await this.usersService.create(user);
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user.id),
    ]);
    await this.refreshTokenStorageService.invalidate(user.id);
    await this.refreshTokenStorageService.set(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async signIn(
    signInDto: SignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user.id),
    ]);
    await this.refreshTokenStorageService.invalidate(user.id);
    await this.refreshTokenStorageService.set(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async refreshToken(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { sub } = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        oldRefreshToken,
        { secret: this.jwtConfiguration.refreshTokenTokenSecret },
      );
      const isValid = await this.refreshTokenStorageService.validate(
        sub,
        oldRefreshToken,
      );
      if (!isValid) throw new UnauthorizedException('Invalid refresh token');
      const user = await this.usersService.findById(sub);
      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(user),
        this.generateRefreshToken(user.id),
      ]);
      await this.refreshTokenStorageService.invalidate(user.id);
      await this.refreshTokenStorageService.set(user.id, refreshToken);
      return { accessToken, refreshToken };
    } catch (_e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signOut(userId: string): Promise<void> {
    await this.refreshTokenStorageService.invalidate(userId);
  }

  private async generateAccessToken(user: User): Promise<string> {
    const accessTokenPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      secret: this.jwtConfiguration.accessTokenSecret,
      expiresIn: this.jwtConfiguration.accessTokenTtl,
    });
    return accessToken;
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshTokenPayload: RefreshTokenPayload = { sub: userId };
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: this.jwtConfiguration.refreshTokenTokenSecret,
      expiresIn: this.jwtConfiguration.refreshTokenTtl,
    });
    return refreshToken;
  }
}
