import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PUBLIC_PATH, STATIC_PATH } from '../lib/constants.js';
import { BadRequestError } from '../lib/errors/BadRequestError.js';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

export const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, PUBLIC_PATH);
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            const filename = `${uuidv4()}${ext}`;
            cb(null, filename);
        },
    }),

    limits: {
        fileSize: FILE_SIZE_LIMIT,
    },

    fileFilter: function (req, file, cb) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            const err = new BadRequestError('png, jpeg, jpg 형식의 이미지만 업로드할 수 있습니다.');
            return cb(err);
        }

        cb(null, true);
    },
});

export async function uploadImage(req, res) {
    if (!req.file) {
        throw new BadRequestError('이미지 파일이 없습니다.');
    }
    const host = req.get('host');
    const filePath = path.join(host, STATIC_PATH, req.file.filename);
    const url = `http://${filePath}`;
    return res.status(201).send({ url });
}
