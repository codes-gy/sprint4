import { CustomError } from './CustomError.js';
export class BadRequestError extends CustomError {
  constructor(message = '잘못된 요청입니다.') {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}
