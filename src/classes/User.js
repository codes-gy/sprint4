import { UnauthorizedError } from '../lib/errors/UnauthorizedError';

export class User {
    constructor({ id, email, nickname, image, createdAt, updatedAt }) {
        this.id = id;
        this.email = email;
        this.nickname = nickname;
        this.image = image;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromEntity(user) {
        if (!user) throw new Error('데이터가 존재하지 않습니다.');
        return new User({
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
    static fromEntityList(users = []) {
        return users.map((user) => User.fromEntity(user));
    }
}

export function assertUserId(req) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('로그인이 필요한 서비스입니다.');
    return userId;
}
