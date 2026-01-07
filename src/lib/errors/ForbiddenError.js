import { CustomError } from './CustomError.js';
export class ForbiddenError extends CustomError {
  constructor(message = '권한이 없습니다.') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}
