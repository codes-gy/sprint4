export class Comment {
    constructor({ id, content, createdAt, updatedAt }) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromEntity(comment) {
        if (!comment) throw new Error('데이터가 존재하지 않습니다.');
        return new Comment({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        });
    }
    static fromEntityList(comments = []) {
        return comments.map((comment) => Comment.fromEntity(comment));
    }
}
