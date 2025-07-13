import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessErrorResponse {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly status: HttpStatus,
  ) {}
}

export class BusinessException extends HttpException {
  constructor(
    message: string,
    code: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    const response = new BusinessErrorResponse(message, code, status);
    super(response, status);
  }
}
