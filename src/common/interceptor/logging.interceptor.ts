import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip;

    const messLogApi = `${new Date().toLocaleDateString()} \t ${method} \t ${url} \t ${ip} \t`;

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`${messLogApi}... ${Date.now() - now}ms`)));
  }
}
