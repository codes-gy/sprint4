import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import { updateComment, deleteComment } from '../controllers/commentsController.js';
import passport from '../lib/passport/index.js';

const commentsRouter = express.Router();

commentsRouter.patch(
    '/:id',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(updateComment),
);
commentsRouter.delete(
    '/:id',
    passport.authenticate('access-token', { session: false, failWithError: true }),
    withAsync(deleteComment),
);

export default commentsRouter;
