import { HttpException, HttpStatus } from '@nestjs/common';

export class ApplicationErrorResponse {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly status: HttpStatus,
  ) {}
}

export class ApplicationException extends HttpException {
  constructor(
    message: string,
    code: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    const response = new ApplicationErrorResponse(message, code, status);
    super(response, status);
  }
}
