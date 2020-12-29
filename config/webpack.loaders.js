const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { I18N_FILES } = require('./webpack.constants');

function getLoaders({ isProductionEnv = false }) {
    return [
        {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: '@atlassian/i18n-properties-loader',
                    options: {
                        i18nFiles: I18N_FILES,
                        disabled: isProductionEnv,
                    },
                },
                {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                    },
                },
            ],
        },

        {
            test: /\.less$/,
            use: [
                {
                    loader: isProductionEnv ? MiniCssExtractPlugin.loader : 'style-loader',
                    options: {
                        sourceMap: true,
                    },
                },
                {
                    loader: 'css-loader',
                    options: {
                        sourceMap: true,
                    },
                },
                {
                    loader: 'less-loader',
                    options: {
                        sourceMap: true,
                    },
                },
            ],
        },

        {
            test: /\.(png|jpg|gif|svg)$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {},
                },
            ],
        },

        {
            test: /\.soy$/,
            use: [
                {
                    loader: '@atlassian/i18n-properties-loader',
                    options: {
                        I18N_FILES,
                        disabled: isProductionEnv,
                    },
                },

                {
                    loader: '@atlassian/soy-loader',
                    options: {
                        dontExpose: true,
                    },
                },
            ],
        },
    ];
}

module.exports.loaders = isProduction => getLoaders(isProduction);
