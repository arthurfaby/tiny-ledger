import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../common/types/api-response.type';

import { AccountNotFoundError } from '../../domain/exceptions/account-not-found.error';
import { InsufficientFundsError } from '../../domain/exceptions/insufficient-funds-error';
import { BusinessRuleValidationError } from '../../domain/exceptions/business-rule-validation.error';
import { ErrorCode } from '../common/enums/error-code.enum';

interface NestErrorPayload {
  message: string | string[];
  statusCode?: number;
  error?: string;
}

function isNestErrorPayload(body: unknown): body is NestErrorPayload {
  return typeof body === 'object' && body !== null && 'message' in body;
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let errors: unknown[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (isNestErrorPayload(exceptionResponse)) {
        if (Array.isArray(exceptionResponse.message)) {
          message = 'Validation failed';
          errorCode = ErrorCode.VALIDATION_ERROR;
          errors = exceptionResponse.message;
        } else {
          message = exceptionResponse.message;
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    } else if (exception instanceof AccountNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      message = exception.message;
      errorCode = ErrorCode.ACCOUNT_NOT_FOUND;
    } else if (exception instanceof BusinessRuleValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
      errorCode = ErrorCode.VALIDATION_ERROR;
    } else if (exception instanceof InsufficientFundsError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
      errorCode = ErrorCode.INSUFFICIENT_FUNDS;
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
    }

    const responseBody: ApiResponse<never> = {
      success: false,
      statusCode,
      errorCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(responseBody);
  }
}
