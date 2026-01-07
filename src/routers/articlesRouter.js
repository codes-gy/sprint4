import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import {
    createArticle,
    getArticleList,
    getArticle,
    updateArticle,
    deleteArticle,
    createComment,
    getCommentList,
    getMyLikedArticles,
    toggleArticleLike,
} from '../controllers/articlesController.js';
import passport from '../lib/passport/index.js';

const articlesRouter = express.Router();

articlesRouter.get(
    '/like/list',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(getMyLikedArticles),
);

articlesRouter.get('/', withAsync(getArticleList));

articlesRouter.post(
    '/:id/comments',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(createComment),
);
articlesRouter.get('/:id/comments', withAsync(getCommentList));

articlesRouter.get('/:id', withAsync(getArticle));
articlesRouter.patch(
    '/:id',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(updateArticle),
);
articlesRouter.delete(
    '/:id',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(deleteArticle),
);

articlesRouter.post(
    '/:id/like',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(toggleArticleLike),
);

articlesRouter.post(
    '/',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(createArticle),
);

export default articlesRouter;
