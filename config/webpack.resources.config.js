const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const { DEV_SERVER_HOST, DEV_SERVER_PORT } = require('./webpack.constants');

const watchConfig = {
    devServer: {
        host: DEV_SERVER_HOST,
        port: DEV_SERVER_PORT,
        overlay: true,
        hot: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
        },
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
    devtool: 'inline-source-map',
};

const devConfig = env => {
    return merge([
        {
            optimization: {
                minimize: false,
            },
        },
        env === 'dev-server' && watchConfig,
    ]);
};

const prodConfig = {
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: {
                        reserved: ['I18n', 'getText'],
                    },
                },
            }),
        ],
    },
    devtool: 'source-map',
};

module.exports = (env, argv = {}) => {
    const isProduction = argv.mode !== 'development';
    const modeConfig = isProduction ? prodConfig : devConfig(env);

    return merge([
        {
            entry: './src/main/resources/js/bpmn_diff.js',
            output: {
                path: path.resolve(__dirname, '../target/classes/js'),
                filename: 'bpmn_diff.bundle.js',
            },
        },
        modeConfig,
    ]);
};
