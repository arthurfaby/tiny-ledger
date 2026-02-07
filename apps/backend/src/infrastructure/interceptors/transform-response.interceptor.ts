import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiResponse } from '../common/types/api-response.type';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse> {
    return next.handle().pipe(
      map((data: unknown) => ({
        success: true,
        data: data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
