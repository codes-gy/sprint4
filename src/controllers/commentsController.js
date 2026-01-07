import { create } from 'superstruct';
import { UpdateCommentBodyStruct } from '../structs/commentsStruct.js';
import { IdParamsStruct } from '../structs/commonStructs.js';
import { NotFoundError } from '../lib/errors/NotFoundError.js';
import { prisma } from '../../prisma/prisma.js';
import { UnauthorizedError } from '../lib/errors/UnauthorizedError.js';
import { ForbiddenError } from '../lib/errors/ForbiddenError.js';
import { Comment } from '../classes/Comment.js';
import { assertUserId } from '../classes/User.js';

export async function updateComment(req, res) {
    const { id } = create(req.params, IdParamsStruct);
    const { content } = create(req.body, UpdateCommentBodyStruct);
    const userId = assertUserId(req);
    const existingComment = await prisma.comment.findUnique({ where: { id } });

    if (!existingComment) {
        throw new NotFoundError('Comment', id);
    }
    if (existingComment.userId !== userId) {
        throw new ForbiddenError('본인의 댓글만 수정할 수 있습니다.');
    }
    const updatedComment = await prisma.comment.update({
        where: { id },
        data: { content },
    });
    const comment = Comment.fromEntity(updatedComment);
    return res.send(comment);
}

export async function deleteComment(req, res) {
    const { id } = create(req.params, IdParamsStruct);
    const userId = assertUserId(req);
    const existingComment = await prisma.comment.findUnique({ where: { id } });

    if (!existingComment) {
        throw new NotFoundError('Comment', id);
    }
    if (existingComment.userId !== userId) {
        throw new ForbiddenError('본인의 댓글만 삭제할 수 있습니다.');
    }
    await prisma.comment.delete({ where: { id } });

    return res.status(204).send();
}
