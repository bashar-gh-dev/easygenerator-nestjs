import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from 'src/iam/config/jwt.config';
import { AccessTokenPayload } from 'src/iam/interfaces/access-token.payload.interface';
import { LOGGED_IN_USER_KEY } from '../consts/logged-in-user-key';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorators/public.decorator';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride(Public, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublicRoute) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken: string | undefined = request.cookies['accessToken'];
    if (!accessToken) throw new UnauthorizedException();
    try {
      const accessTokenPayload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(accessToken, {
          secret: this.jwtConfiguration.accessTokenSecret,
        });
      request[LOGGED_IN_USER_KEY] = accessTokenPayload;
      return true;
    } catch (e) {
      if (e.name === TokenExpiredError.name) {
        throw new ForbiddenException('Expired access token');
      }
      throw new UnauthorizedException();
    }
  }
}
