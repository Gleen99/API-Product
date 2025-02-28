module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
    moduleFileExtensions: ["ts", "js", "json"],
    testMatch: ["**/tests/**/*.test.ts"],
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 90,
            lines: 90,
            statements: 90
        }
    }
};