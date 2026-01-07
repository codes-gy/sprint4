import express from 'express';
import cors from 'cors';
import path from 'path';
import { PORT, PUBLIC_PATH, STATIC_PATH } from './lib/constants.js';
import articlesRouter from './routers/articlesRouter.js';
import productsRouter from './routers/productsRouter.js';
import commentsRouter from './routers/commentsRouter.js';
import imagesRouter from './routers/imagesRouter.js';
import authsRouter from './routers/authRouter.js';
import { defaultNotFoundHandler, globalErrorHandler } from './controllers/errorController.js';
import cookieParser from 'cookie-parser';
import passport from './lib/passport/index.js';
import { specs, swaggerUi } from './lib/swagger.util.js';
import homeRouter from './routers/homeRouter.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

app.use('/articles', articlesRouter);
app.use('/products', productsRouter);
app.use('/comments', commentsRouter);
app.use('/images', imagesRouter);
app.use('/auth', authsRouter);

if (process.env.NODE_ENV !== 'TEST') {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
}

app.use('/', homeRouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

export default app;
