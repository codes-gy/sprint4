import { StructError } from 'superstruct';
import { BadRequestError } from '../lib/errors/BadRequestError.js';
import { NotFoundError } from '../lib/errors/NotFoundError.js';
import { ConflictError } from '../lib/errors/ConflictError.js';
import { ForbiddenError } from '../lib/errors/ForbiddenError.js';
import { UnauthorizedError } from '../lib/errors/UnauthorizedError.js';
import { error } from 'console';

export function defaultNotFoundHandler(req, res, next) {
    return res.status(404).send({
        message: '요청하신 페이지를 찾을 수 없습니다.',
    });
}

export function globalErrorHandler(err, req, res, next) {
    // console.error(err.stack);
    if (err instanceof BadRequestError) {
        return res.status(400).send({
            message: err.message,
        });
    }

    // 2. 인증 필요 (Unauthorized - 401)
    if (err instanceof UnauthorizedError) {
        return res.status(401).send({
            message: err.message,
        });
    }

    // 3. 권한 없음 (Forbidden - 403)
    if (err instanceof ForbiddenError) {
        return res.status(403).send({
            message: err.message,
        });
    }

    // 4. 리소스 찾을 수 없음 (NotFound - 404)
    if (err instanceof NotFoundError) {
        return res.status(404).send({
            message: err.message,
        });
    }

    // 5. 데이터 충돌/중복 (Conflict - 409)
    if (err instanceof ConflictError) {
        return res.status(409).send({
            message: err.message,
        });
    }

    /** From superstruct or application error */
    if (err instanceof StructError) {
        return res.status(400).send({
            message: '입력값이 올바르지 않습니다.',
            details: err.failures(),
        });
    }

    /** From express.json middleware */
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).send({
            message: '잘못된 JSON 형식입니다.',
        });
    }
    if (err.name === 'AuthenticationError') {
        return res.status(401).send({
            message: '인증에 실패하였습니다.',
        });
    }

    /** Prisma error codes */
    if (err.code) {
        console.error(err);
        return res.status(500).send({ message: '데이터 처리 중 오류가 발생했습니다.' });
    }

    return res.status(500).send({ message: '서버 내부 오류가 발생했습니다.' });
}
