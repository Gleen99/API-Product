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
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95
        }
    }
};