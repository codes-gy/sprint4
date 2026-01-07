import { create } from 'superstruct';
import { prisma } from '../../prisma/prisma.js';
import { IdParamsStruct } from '../structs/commonStructs.js';
import {
    CreateProductBodyStruct,
    GetProductListParamsStruct,
    UpdateProductBodyStruct,
} from '../structs/productsStruct.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentsStruct.js';
import { NotFoundError } from '../lib/errors/NotFoundError.js';
import { UnauthorizedError } from '../lib/errors/UnauthorizedError.js';
import { ForbiddenError } from '../lib/errors/ForbiddenError.js';
import { Product } from '../classes/Product.js';
import { Comment } from '../classes/Comment.js';
import { assertUserId } from '../classes/User.js';

export async function createProduct(req, res) {
    const { name, description, price, tags, images } = create(req.body, CreateProductBodyStruct);
    const userId = assertUserId(req);
    const createProduct = await prisma.product.create({
        data: { name, description, price, tags, images, userId },
    });
    const product = Product.fromEntity(createProduct);
    res.status(201).send(product);
}

export async function getProduct(req, res) {
    const { id } = create(req.params, IdParamsStruct);

    const findProduct = await prisma.product.findUnique({ where: { id } });
    if (!findProduct) {
        throw new NotFoundError('Product', id);
    }
    const product = Product.fromEntity(findProduct);
    return res.send(product);
}

export async function updateProduct(req, res) {
    const { id } = create(req.params, IdParamsStruct);
    const { name, description, price, tags, images } = create(req.body, UpdateProductBodyStruct);
    const userId = assertUserId(req);
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
        throw new NotFoundError('Product', id);
    }
    if (existingProduct.userId !== userId) {
        throw new ForbiddenError('본인의 상품만 수정할 수 있습니다.');
    }
    const updatedProduct = await prisma.product.update({
        where: { id },
        data: { name, description, price, tags, images },
    });

    const product = Product.fromEntity(updatedProduct);

    return res.send(product);
}

export async function deleteProduct(req, res) {
    const { id } = create(req.params, IdParamsStruct);
    const userId = assertUserId(req);
    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
        throw new NotFoundError('Product', id);
    }
    if (existingProduct.userId !== userId) {
        throw new ForbiddenError('본인의 상품만 삭제할 수 있습니다.');
    }
    await prisma.product.delete({ where: { id } });

    return res.status(204).send();
}

export async function getProductList(req, res) {
    const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);

    const where = keyword
        ? {
              OR: [{ name: { contains: keyword } }, { description: { contains: keyword } }],
          }
        : undefined;
    const totalCount = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy === 'recent' ? { id: 'desc' } : { id: 'asc' },
        where,
    });

    return res.send({
        list: Product.fromEntityList(products),
        totalCount,
    });
}

export async function createComment(req, res) {
    const { id: productId } = create(req.params, IdParamsStruct);
    const { content } = create(req.body, CreateCommentBodyStruct);
    const userId = assertUserId(req);
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
        throw new NotFoundError('Product', productId);
    }

    const createComment = await prisma.comment.create({ data: { productId, content, userId } });
    const comment = Comment.fromEntity(createComment);
    return res.status(201).send(comment);
}

export async function getCommentList(req, res) {
    const { id: productId } = create(req.params, IdParamsStruct);
    const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
        throw new NotFoundError('Product', productId);
    }

    const commentsWithCursorComment = await prisma.comment.findMany({
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
        where: { productId },
    });
    const comments = commentsWithCursorComment.slice(0, limit);
    const cursorComment = commentsWithCursorComment[comments.length - 1];
    const nextCursor = cursorComment ? cursorComment.id : null;

    return res.send({
        list: Comment.fromEntityList(comments),
        nextCursor,
    });
}

export async function toggleProductLike(req, res) {
    const { id: productId } = create(req.params, IdParamsStruct); // 상품 ID
    const userId = assertUserId(req);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
        throw new NotFoundError('Product', productId);
    }

    const existingLike = await prisma.productLike.findUnique({
        where: {
            userId_productId: { userId, productId: productId },
        },
    });

    if (existingLike) {
        await prisma.productLike.delete({
            where: { id: existingLike.id },
        });
        return res.status(200).json({ isLiked: false });
    } else {
        await prisma.productLike.create({
            data: {
                userId,
                productId: productId,
            },
        });
        return res.status(201).json({ isLiked: true });
    }
}
export async function getMyLikedProducts(req, res) {
    const userId = assertUserId(req);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [totalCount, likedProducts] = await Promise.all([
        prisma.productLike.count({ where: { userId } }),
        prisma.productLike.findMany({
            where: { userId },
            include: { product: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
    ]);

    // 가공해서 상품 리스트만 반환
    const products = likedProducts.map((item) => item.product);
    const result = Product.fromEntityList(products);
    res.status(200).json({
        data: result,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
    });
}
