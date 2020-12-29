const WrmPlugin = require('atlassian-webresource-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const { PLUGIN_KEY, WRM_OUTPUT, PROVIDED_DEPENDENCIES } = require('./webpack.constants');

const plugins = shouldWatch => [
    new WrmPlugin({
        pluginKey: PLUGIN_KEY,
        xmlDescriptors: WRM_OUTPUT,
        providedDependencies: PROVIDED_DEPENDENCIES,
        watch: shouldWatch,
        watchPrepare: shouldWatch,
    }),

    new DuplicatePackageCheckerPlugin(),
];

module.exports = {
    plugins,
};
