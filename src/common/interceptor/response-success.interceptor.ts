import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class ResonseSuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse();

    const now = Date.now();
    return next.handle().pipe(
      map((data) => {
        return {
          status: 'Success',
          statusCode: res.statusCode,
          data: data,
        };
      }),
    );
  }
}
