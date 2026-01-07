import app from './main.js';
import { PORT } from './lib/constants.js';
app.listen(PORT, () => {
    console.log(`${PORT}번 포트에서 서버 실행 중...`);
});
