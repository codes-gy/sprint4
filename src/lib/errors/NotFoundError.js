import { CustomError } from './CustomError.js';

const MODEL_NAME = {
    User: '사용자',
    Product: '상품',
    Article: '게시글',
    Comment: '댓글',
    ProductLike: '상품 좋아요',
    ArticleLike: '게시글 좋아요',
};

export class NotFoundError extends CustomError {
    constructor(modelName, id) {
        const errorModelName = MODEL_NAME[modelName] || modelName;

        super(`${errorModelName}을(를) 찾을 수 없습니다. (id : ${id})`);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}
