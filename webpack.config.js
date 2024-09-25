const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// Customizable plugin
function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));

    return templateFiles.map(template => {
        const separateParts = path.parse(template);
        const templateName = separateParts.name;
        const templateExtension = separateParts.ext;

        if (templateExtension === '.twig') {
            return new HtmlWebpackPlugin({
                filename: `../pages/${templateName}.html`,
                template: path.resolve(__dirname, `${templateDir}/${templateName}${templateExtension}`),
                inject: false,
            });
        }
    }).filter(Boolean);
}

const htmlPlugins = generateHtmlPlugins('./marmite-src/views/pages');

module.exports = {
    entry: {
        styles: path.resolve(__dirname, './marmite-src/assets/scss/styles.scss'),
        print: path.resolve(__dirname, './marmite-src/assets/scss/print.scss')
    },

    output: {
        path: path.resolve(__dirname, './marmite-dist/assets'),
        filename: 'jsbundles/[name].bundle.js',
        clean: true,

    },

    module: {
        rules: [
            {
                test: /\.twig$/,
                use: ['twig-loader']
            },
            {
                test: /\.(scss)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [require('autoprefixer')],
                            },
                        },
                    },
                    'sass-loader'
                ],
            }
        ]
    },

    plugins: [
        ...htmlPlugins,
        new MiniCssExtractPlugin({
            filename: 'css/[name].min.css',
        }),
    ],

    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin(),
        ],
    },

    mode: 'production'
}