export default {
    testEnvironment: 'node',

    // tests 폴더만 테스트 대상으로
    roots: ['<rootDir>/tests'],

    // test 파일 규칙
    testMatch: ['**/*Test.js'],

    clearMocks: true,

    // 공통 setup 파일
    //setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
};
