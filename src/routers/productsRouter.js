import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import {
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductList,
    createComment,
    getCommentList,
    toggleProductLike,
    getMyLikedProducts,
} from '../controllers/productsController.js';
import passport from '../lib/passport/index.js';
const productsRouter = express.Router();

//좋아요한 상품 목록
productsRouter.get(
    '/like/list',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(getMyLikedProducts),
);
//답글 작성
productsRouter.post(
    '/:id/comments',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(createComment),
);
//답글 조회
productsRouter.get('/:id/comments', withAsync(getCommentList));
//상품추가
productsRouter.post(
    '/',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(createProduct),
);
//상품조회
productsRouter.get('/:id', withAsync(getProduct));
productsRouter.patch(
    '/:id',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(updateProduct),
);
productsRouter.delete(
    '/:id',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(deleteProduct),
);
//상품 좋아
productsRouter.post(
    '/:id/like',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(toggleProductLike),
);
//상품목록
productsRouter.get('/', withAsync(getProductList));
export default productsRouter;
