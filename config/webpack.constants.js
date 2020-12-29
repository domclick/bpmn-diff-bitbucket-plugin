const path = require('path');
const glob = require('glob');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

const I18N_SRC_DIR = path.join(srcDir, 'main/resources/i18n');
const FRONTEND_SRC_DIR = path.join(srcDir, 'main/bpmn-diff-bitbucket-plugin');
const FRONTEND_OUTPUT_DIR = path.join(rootDir, 'target', 'classes');

// Plugin key needs to match the one provide in atlassian-plugin.xml file
const PLUGIN_KEY = 'ru.domclick.bitbucket.bpmn-diff-bitbucket-plugin';

// Load i18n properties files
const I18N_FILES = glob.sync('**/*.properties', {
    cwd: I18N_SRC_DIR,
    absolute: true,
});

const WRM_OUTPUT = path.join(
    FRONTEND_OUTPUT_DIR,
    'META-INF/plugin-descriptors/wr-webpack-bundles.xml'
);

// Map of dependence's modules provided by Bitbucket in runtime
const PROVIDED_DEPENDENCIES = {
    // WRM
    'wrm/context-path': {
        dependency: 'com.atlassian.plugins.atlassian-plugins-webresource-plugin:context-path',
        import: {
            var: "require('wrm/context-path')",
            amd: 'wrm/context-path',
        },
    },
    'wrm/format': {
        dependency: 'com.atlassian.plugins.atlassian-plugins-webresource-plugin:format',
        import: {
            var: 'require("wrm/format")',
            amd: 'wrm/format',
        },
    },
    'wrm/i18n': {
        dependency: 'com.atlassian.plugins.atlassian-plugins-webresource-plugin:i18n',
        import: {
            var: 'require("wrm/i18n")',
            amd: 'wrm/i18n',
        },
    },

    // Bitbucket
    'bitbucket/util/navbuilder': {
        dependency: 'com.atlassian.bitbucket.server.bitbucket-web-api:navbuilder',
        import: {
            amd: 'bitbucket/util/navbuilder',
            var: "require('bitbucket/util/navbuilder')",
        },
    },

    'bitbucket/util/server': {
        dependency: 'com.atlassian.bitbucket.server.bitbucket-web-api:server',
        import: {
            amd: 'bitbucket/util/server',
            var: "require('bitbucket/util/server')",
        },
    },

    'bitbucket/util/state': {
        dependency: 'com.atlassian.bitbucket.state.bitbucket-web-api:state',
        import: {
            amd: 'bitbucket/util/state',
            var: "require('bitbucket/util/state')",
        },
    },

    'bitbucket/util/events': {
        dependency: 'com.atlassian.bitbucket.events.bitbucket-web-api:events',
        import: {
            amd: 'bitbucket/util/events',
            var: "require('bitbucket/util/events')",
        },
    },
};

const DEV_SERVER_PORT = 3333;
const DEV_SERVER_HOST = 'localhost';

module.exports = {
    srcDir,
    I18N_SRC_DIR,
    FRONTEND_SRC_DIR,
    FRONTEND_OUTPUT_DIR,
    I18N_FILES,
    WRM_OUTPUT,
    PLUGIN_KEY,
    DEV_SERVER_PORT,
    DEV_SERVER_HOST,
    PROVIDED_DEPENDENCIES,
};
