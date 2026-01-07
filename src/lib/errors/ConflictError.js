import { CustomError } from './CustomError.js';
export class ConflictError extends CustomError {
  constructor(message = '이미 존재하는 데이터입니다.') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}
