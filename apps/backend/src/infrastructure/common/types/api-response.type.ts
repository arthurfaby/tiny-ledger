import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums/error-code.enum';

export type ApiResponse<T = unknown> = (
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      statusCode: HttpStatus;
      errorCode: ErrorCode;
      message: string;
      errors: unknown[];
    }
) & {
  timestamp: string;
};
