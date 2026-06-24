import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

type ErrorResponseBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const normalized = this.normalizeResponse(exceptionResponse, statusCode);

    if (statusCode >= 500) {
      console.error(exception);
    }

    response.status(statusCode).json({
      statusCode,
      message: normalized.message,
      error: normalized.error,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeResponse(
    exceptionResponse: string | object | undefined,
    statusCode: number,
  ): Required<Pick<ErrorResponseBody, "message" | "error">> {
    if (typeof exceptionResponse === "string") {
      return {
        message: exceptionResponse,
        error: this.defaultError(statusCode),
      };
    }

    if (this.isErrorResponseBody(exceptionResponse)) {
      return {
        message: exceptionResponse.message ?? this.defaultMessage(statusCode),
        error: exceptionResponse.error ?? this.defaultError(statusCode),
      };
    }

    return {
      message: this.defaultMessage(statusCode),
      error: this.defaultError(statusCode),
    };
  }

  private isErrorResponseBody(value: unknown): value is ErrorResponseBody {
    return typeof value === "object" && value !== null;
  }

  private defaultMessage(statusCode: number) {
    return statusCode === HttpStatus.INTERNAL_SERVER_ERROR
      ? "Internal server error"
      : "Request failed";
  }

  private defaultError(statusCode: number) {
    return statusCode === HttpStatus.INTERNAL_SERVER_ERROR
      ? "Internal Server Error"
      : "HTTP Error";
  }
}
