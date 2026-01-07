import { create } from 'superstruct';
import { IdParamsStruct } from '../structs/commonStructs.js';
import {
    CreateArticleBodyStruct,
    UpdateArticleBodyStruct,
    GetArticleListParamsStruct,
} from '../structs/articlesStructs.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentsStruct.js';
import { NotFoundError } from '../lib/errors/NotFoundError.js';
import { prisma } from '../../prisma/prisma.js';
import { ForbiddenError } from '../lib/errors/ForbiddenError.js';
import { UnauthorizedError } from '../lib/errors/UnauthorizedError.js';
import { Article } from '../classes/Article.js';
import { Comment } from '../classes/Comment.js';
import { assertUserId } from '../classes/User.js';

export async function createArticle(req, res) {
    const { title, content, image } = create(req.body, CreateArticleBodyStruct);
    const userId = assertUserId(req);
    const createArticle = await prisma.article.create({
        data: {
            title,
            content,
            image,
            userId,
        },
    });

    const article = Article.fromEntity(createArticle);
    return res.status(201).send(article);
}

export async function getArticle(req, res) {
    const { id } = create(req.params, IdParamsStruct);

    const findArticle = await prisma.article.findUnique({ where: { id } });
    if (!findArticle) {
        throw new NotFoundError('Article', id);
    }
    const article = Article.fromEntity(findArticle);

    return res.send(article);
}

export async function updateArticle(req, res) {
    const { id } = create(req.params, IdParamsStruct);
    const { title, content, image } = create(req.body, UpdateArticleBodyStruct);
    const userId = assertUserId(req);
    const existingArticle = await prisma.article.findUnique({ where: { id } });
    if (!existingArticle) {
        throw new NotFoundError('Article', id);
    }
    if (existingArticle.userId !== userId) {
        throw new ForbiddenError('본인의 게시글만 수정/삭제할 수 있습니다.');
    }
    const updatedArticle = await prisma.article.update({
        where: { id },
        data: {
            title,
            content,
            image,
        },
    });
    const article = Article.fromEntity(updatedArticle);

    return res.send(article);
}

export async function deleteArticle(req, res) {
    const { id } = create(req.params, IdParamsStruct);
    const userId = assertUserId(req);
    const existingArticle = await prisma.article.findUnique({ where: { id } });
    if (!existingArticle) {
        throw new NotFoundError('Article', id);
    }
    if (existingArticle.userId !== userId) {
        throw new ForbiddenError('본인의 게시글만 수정/삭제할 수 있습니다.');
    }
    await prisma.article.delete({ where: { id } });

    return res.status(204).send();
}

export async function getArticleList(req, res) {
    const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);

    const where = {
        title: keyword ? { contains: keyword } : undefined,
    };

    const totalCount = await prisma.article.count({ where });
    const articles = await prisma.article.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
        where,
    });

    return res.send({
        list: Article.fromEntityList(articles),
        totalCount,
    });
}

export async function createComment(req, res) {
    const { id: articleId } = create(req.params, IdParamsStruct);
    const { content } = create(req.body, CreateCommentBodyStruct);
    const userId = assertUserId(req);
    const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });

    if (!existingArticle) {
        throw new NotFoundError('Article', articleId);
    }

    const createComment = await prisma.comment.create({
        data: {
            articleId,
            content,
            userId,
        },
    });
    const comment = Comment.fromEntity(createComment);
    return res.status(201).send(comment);
}

export async function getCommentList(req, res) {
    const { id: articleId } = create(req.params, IdParamsStruct);
    const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
        throw new NotFoundError('Article', articleId);
    }

    const commentsWithCursor = await prisma.comment.findMany({
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
        where: { articleId },
        orderBy: { createdAt: 'desc' },
    });
    const comments = commentsWithCursor.slice(0, limit);
    const cursorComment = commentsWithCursor[commentsWithCursor.length - 1];
    const nextCursor = cursorComment ? cursorComment.id : null;

    return res.send({
        list: Comment.fromEntityList(comments),
        nextCursor,
    });
}

export async function toggleArticleLike(req, res) {
    const { id: articleId } = create(req.params, IdParamsStruct); // 상품 ID
    const userId = assertUserId(req);

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
        throw new NotFoundError('Article', articleId);
    }

    // 1. 좋아요 기록이 이미 있는지 확인
    const existingLike = await prisma.articleLike.findUnique({
        where: {
            userId_articleId: { userId, articleId: Number(articleId) },
        },
    });

    if (existingLike) {
        // 2. 이미 있다면? 삭제 (좋아요 취소)
        await prisma.articleLike.delete({
            where: { id: existingLike.id },
        });
        return res.status(200).json({ isLiked: false });
    } else {
        // 3. 없다면? 생성 (좋아요 하기)
        await prisma.articleLike.create({
            data: {
                userId,
                articleId: Number(articleId),
            },
        });
        return res.status(201).json({
            isLiked: true,
        });
    }
}
export async function getMyLikedArticles(req, res) {
    const userId = assertUserId(req);
    const likedArticles = await prisma.articleLike.findMany({
        where: { userId },
        include: {
            article: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // 게시글 반환
    const result = likedArticles.map((item) => Article.fromEntity(item.article));
    res.send(result);
}
