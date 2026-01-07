import { assert, create } from 'superstruct';
import bcrypt from 'bcrypt';
import { prisma } from '../../prisma/prisma.js';
import {
    ChangePasswordBodyStruct,
    RegisterBodyStruct,
    UpdateMeBodyStruct,
} from '../structs/authStructs.js';
import { clearTokenCookies, generateTokens, setTokenCookies } from '../lib/token.js';
import { ConflictError } from '../lib/errors/ConflictError.js';
import { UnauthorizedError } from '../lib/errors/UnauthorizedError.js';
import { BadRequestError } from '../lib/errors/BadRequestError.js';
import { NotFoundError } from '../lib/errors/NotFoundError.js';
import { assertUserId, User } from '../classes/User.js';

export async function login(req, res) {
    const data = req.user;

    const { accessToken, refreshToken } = generateTokens(data.id);
    setTokenCookies(res, accessToken, refreshToken);

    const user = User.fromEntity(data);

    res.json({
        message: '로그인 성공',
        data: { id: user.id, email: user.email },
    });
}

export async function register(req, res) {
    // 1. 데이터 유효성 검사
    const { email, nickname, password } = req.body;
    assert({ email, nickname, password }, RegisterBodyStruct);

    // 2. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { nickname }],
        },
    });
    if (existingUser) {
        if (existingUser.email === email) {
            throw new ConflictError('이미 가입된 이메일입니다.');
        }
        if (existingUser?.nickname === nickname) {
            throw new ConflictError('이미 사용 중인 닉네임입니다.');
        }
    }

    // 3. 유저 생성
    const data = await prisma.user.create({
        data: {
            email,
            nickname,
            password: hashedPassword,
        },
    });
    const user = User.fromEntity(data);

    res.status(201).json({
        message: '회원가입 성공',
        data: { id: user.id, email: user.email },
    });
}

export function logout(req, res) {
    clearTokenCookies(res);

    res.json({
        message: '로그아웃 되었습니다.',
    });
}

export async function me(req, res) {
    const user = req.user;

    if (!user) {
        throw new UnauthorizedError('로그인이 필요한 서비스입니다.');
    }
    res.json({
        data: User.fromEntity(user),
    });
}

export async function updateMe(req, res) {
    const data = create(req.body, UpdateMeBodyStruct);
    const userId = assertUserId(req);
    const actualChanges = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => value !== req.user?.[key]),
    );

    if (Object.keys(actualChanges).length === 0) {
        throw new BadRequestError('수정된 내용이 없습니다.');
    }
    const existingUser = await prisma.user.findFirst({
        where: {
            id: { not: userId },
            OR: [
                data?.email ? { email: data.email } : undefined,
                data?.nickname ? { nickname: data.nickname } : undefined,
            ].filter(Boolean),
        },
    });
    if (existingUser) {
        if (existingUser?.email === data?.email) {
            throw new ConflictError('이미 가입된 이메일입니다.');
        }
        if (existingUser?.nickname === data?.nickname) {
            throw new ConflictError('이미 사용 중인 닉네임입니다.');
        }
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: data,
        select: {
            id: true,
            email: true,
            nickname: true,
            image: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    res.json({
        data: User.fromEntity(updatedUser),
    });
}

export async function changePassword(req, res) {
    const { currentPassword, newPassword } = create(req.body, ChangePasswordBodyStruct);
    const userId = assertUserId(req);
    if (currentPassword === newPassword) {
        throw new BadRequestError('새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.');
    }

    // 현재 유저의 비밀번호 정보를 가져옴
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new NotFoundError('User', userId);
    }
    // 기존 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new BadRequestError('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호 암호화 및 저장
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });

    res.json({
        message: '비밀번호가 성공적으로 변경되었습니다.',
    });
}

export async function refreshTokens(req, res) {
    const user = req.user;
    if (!user?.id) throw new UnauthorizedError('로그인이 필요한 서비스입니다.');

    const { accessToken, refreshToken } = generateTokens(req.user.id);
    setTokenCookies(res, accessToken, refreshToken);
    res.status(200).json({
        message: '토큰이 성공적으로 재발급되었습니다.',
    });
}
