const path = require('path');

const paths = {
    mocksRoot: path.resolve('./src/mocks'),
    testsRoot: path.resolve('./src/main/bpmn-diff/'),
};

module.exports = {
    clearMocks: true,
    verbose: true,
    roots: [paths.testsRoot],
    moduleFileExtensions: ['js', 'jsx', 'json'],
    transformIgnorePatterns: ['node_modules/(?!(@atlassian/clientside-[^/]+))/'],
    moduleNameMapper: {
        '^wrm/i18n$': path.join(paths.mocksRoot, './wrm/i18n.js'),
        '^wrm/context-path$': path.join(paths.mocksRoot, './wrm/context-path.js'),
        '^@atlassian/wrm-react-i18n$': path.join(paths.mocksRoot, './@atlassian/wrm-react-i18n.js'),
        '\\.(css|less)$': 'identity-obj-proxy',
    },
    testMatch: ['**/__tests__/**/*.+(js|jsx)', '**/?(*.)+(spec|test).+(js|jsx)'],
};
