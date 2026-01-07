import { CustomError } from './CustomError.js';
export class UnauthorizedError extends CustomError {
  constructor(message = '인증이 필요합니다.') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}
