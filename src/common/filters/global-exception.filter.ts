import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  PrismaClientValidationError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions (BadRequestException, NotFoundException, etc.)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.constructor.name;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const responseObj = exceptionResponse as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message = responseObj.message || exception.message;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error = responseObj.error || exception.constructor.name;
      } else {
        message = exception.message;
        error = exception.constructor.name;
      }
    } else if (exception instanceof PrismaClientValidationError) {
      // Handle Prisma validation errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided to database operation';
      error = 'Database Validation Error';

      this.logger.error('Prisma validation error:', {
        originalError: exception.message,
        path: request.url,
        method: request.method,
      });
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Handle Prisma known errors (unique constraint violations, foreign key errors, etc.)
      status = HttpStatus.BAD_REQUEST;

      switch (exception.code) {
        case 'P2002':
          message = 'A record with this data already exists';
          error = 'Duplicate Record Error';
          break;
        case 'P2025':
          message = 'Record not found';
          error = 'Not Found Error';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = 'Invalid reference to related record';
          error = 'Foreign Key Error';
          break;
        default:
          message = 'Database operation failed';
          error = 'Database Error';
      }

      this.logger.error('Prisma known error:', {
        code: exception.code,
        originalError: exception.message,
        path: request.url,
        method: request.method,
      });
    } else if (exception instanceof Error) {
      // Handle generic JavaScript errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error';
      error = 'Internal Server Error';

      this.logger.error('Unhandled error:', {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
        path: request.url,
        method: request.method,
      });
    } else {
      // Handle unknown exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      error = 'Unknown Error';

      this.logger.error('Unknown exception:', {
        exception,
        path: request.url,
        method: request.method,
      });
    }

    // Send the error response
    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
