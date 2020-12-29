const TerserPlugin = require('terser-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');
const ClientsideExtensionWebpackPlugin = require('@atlassian/clientside-extensions-webpack-plugin');

const {
    DEV_SERVER_HOST,
    DEV_SERVER_PORT,
    FRONTEND_OUTPUT_DIR,
    FRONTEND_SRC_DIR,
} = require('./webpack.constants');

const { plugins } = require('./webpack.plugins');
const { loaders } = require('./webpack.loaders');

const clientsideExtensions = new ClientsideExtensionWebpackPlugin({
    cwd: FRONTEND_SRC_DIR,
    pattern: 'extensions/**/*-extension.js*',
});

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
            output: {
                publicPath: `http://${DEV_SERVER_HOST}:${DEV_SERVER_PORT}/`,
                filename: '[name].js',
                chunkFilename: '[name].chunk.js',
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
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
    },

    devtool: 'source-map',
};

module.exports = (env, argv = {}) => {
    const isProduction = argv.mode !== 'development';
    const modeConfig = isProduction ? prodConfig : devConfig(env);

    return merge([
        {
            mode: argv.mode,

            entry: {
                ...clientsideExtensions.generateEntrypoints(),
            },

            resolve: {
                extensions: ['.js', '.jsx'],
            },

            stats: {
                logging: 'info',
            },

            context: FRONTEND_SRC_DIR,
            plugins: [...plugins(!isProduction), clientsideExtensions],

            // Required to have a single version of styled-components in the runtime
            optimization: {
                splitChunks: {
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            chunks: 'all',
                            name: 'vendor',
                            enforce: true,
                        },
                    },
                },

                runtimeChunk: {
                    name: 'vendor',
                },
            },

            module: {
                rules: loaders(isProduction),
            },

            output: {
                path: FRONTEND_OUTPUT_DIR,
            },
        },
        modeConfig,
    ]);
};
