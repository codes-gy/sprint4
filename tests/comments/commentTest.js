import request from 'supertest';
import app from '../../src/main.js';
import { prisma } from '../../prisma/prisma.js';

describe('답글 통합 테스트', () => {
    let authCookie, otherUserCookie;
    let productId, articleId;
    let productCommentId, articleCommentId;

    const testUserA = {
        email: 'comm_test_01@example.com',
        nickname: '답글유저1',
        password: 'password123',
    };
    const testUserB = {
        email: 'comm_test_02@example.com',
        nickname: '답글유저2',
        password: 'password123',
    };

    const setupUser = async (user) => {
        await request(app).post('/auth/register').send(user);
        const res = await request(app).post('/auth/login').send({
            email: user.email,
            password: user.password,
        });
        return res.headers['set-cookie'];
    };

    beforeAll(async () => {
        await Promise.all([
            prisma.comment.deleteMany(),
            prisma.product.deleteMany(),
            prisma.article.deleteMany(),
        ]);
        await prisma.user.deleteMany({
            where: { email: { in: ['comm_test_01@example.com', 'comm_test_02@example.com'] } },
        });
        authCookie = await setupUser({
            email: 'comm_test_01@example.com',
            nickname: '답글유저1',
            password: 'password123',
        });
        otherUserCookie = await setupUser({
            email: 'comm_test_02@example.com',
            nickname: '답글유저2',
            password: 'password123',
        });

        const [productResult, articleResult] = await Promise.all([
            request(app)
                .post('/products')
                .set('Cookie', authCookie)
                .send({
                    name: '상품',
                    description: '설명',
                    price: 1000,
                    tags: ['태그'],
                    images: ['http://img.com'],
                }),
            request(app).post('/articles').set('Cookie', authCookie).send({
                title: '게시글',
                content: '내용',
                image: 'https://example.com/default.png',
            }),
        ]);
        productId = productResult.body.id;
        articleId = articleResult.body.id;
        if (!productId || !articleId) throw new Error('부모 데이터 생성 실패로 테스트를 중단');
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('답글 추가(상품)', () => {
        it('상품에 답글을 추가할 수 있다', async () => {
            const res = await request(app)
                .post(`/products/${productId}/comments`)
                .set('Cookie', authCookie)
                .send({ content: '상품 답글입니다.' });

            expect(res.statusCode).toBe(201);
            expect(res.body.content).toBe('상품 답글입니다.');
            productCommentId = res.body.id;
            expect(Number.isInteger(productCommentId)).toBe(true);
        });
    });

    describe('답글 추가(게시글)', () => {
        it('게시글에 답글을 추가할 수 있다', async () => {
            const res = await request(app)
                .post(`/articles/${articleId}/comments`)
                .set('Cookie', authCookie)
                .send({ content: '게시글 답글입니다.' });

            expect(res.statusCode).toBe(201);
            articleCommentId = res.body.id;
            expect(Number.isInteger(articleCommentId)).toBe(true);
        });
    });

    describe('답글 수정', () => {
        it('본인이 작성한 답글은 수정할 수 있다', async () => {
            const res = await request(app)
                .patch(`/comments/${productCommentId}`)
                .set('Cookie', authCookie)
                .send({ content: '수정된 답글 내용' });

            expect(res.statusCode).toBe(200);
            expect(res.body.content).toBe('수정된 답글 내용');
        });

        it('타인의 답글을 수정하려고 하면 403 에러를 반환한다', async () => {
            const res = await request(app)
                .patch(`/comments/${productCommentId}`)
                .set('Cookie', otherUserCookie)
                .send({ content: '답글 내용' });

            expect(res.statusCode).toBe(403);
        });

        it('존재하지 않는 답글 수정 시 404 에러를 반환한다', async () => {
            const res = await request(app)
                .patch('/comments/999999')
                .set('Cookie', authCookie)
                .send({ content: '답글 내용' });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('답글 삭제', () => {
        it('타인의 답글은 삭제할 수 없다 (403)', async () => {
            const res = await request(app)
                .delete(`/comments/${articleCommentId}`)
                .set('Cookie', otherUserCookie);

            expect(res.statusCode).toBe(403);
        });

        it('본인의 답글은 삭제할 수 있다 (204)', async () => {
            const res = await request(app)
                .delete(`/comments/${articleCommentId}`)
                .set('Cookie', authCookie);

            expect(res.statusCode).toBe(204);
        });

        it('삭제된 후 다시 삭제를 시도하면 404 에러를 반환한다', async () => {
            const res = await request(app)
                .delete(`/comments/${articleCommentId}`)
                .set('Cookie', authCookie);

            expect(res.statusCode).toBe(404);
        });
    });
});
