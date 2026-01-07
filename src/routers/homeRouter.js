import express from 'express';
import { withAsync } from '../lib/withAsync.js';

const homeRouter = express.Router();

homeRouter.get(
    '/',
    withAsync((req, res) => {
        res.redirect('/docs');
    }),
);

export default homeRouter;
