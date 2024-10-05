const path = require('path');
const fs = require('fs');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

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
                minify: false,
            });
        }
    }).filter(Boolean);
}

const htmlPlugins = generateHtmlPlugins('./marmite-src/views/pages');

module.exports = {
    entry: {
        styles: path.resolve(__dirname, './marmite-src/assets/scss/styles.scss'),
        print: path.resolve(__dirname, './marmite-src/assets/scss/print.scss'),
        script: path.resolve(__dirname, './marmite-src/assets/js/script-front.js'),
        svgSprite: path.resolve(__dirname, './marmite-src/assets/js/svg-sprite.js')
    },

    output: {
        path: path.resolve(__dirname, './marmite-dist/assets'),
        filename: (pathData) => {
            return pathData.chunk.name === 'script'
                ? 'js/[name].min.js'
                : 'jsbundles/[name].bundle.js';
        },
        clean: true,
    },

    module: {
        rules: [
            {
                test: /\.twig$/,
                use: ['twig-loader']
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                        },
                    },
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
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    },
                    {
                        loader: 'eslint-loader',
                        options: {
                            emitWarning: true,
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                include: [path.resolve(__dirname, './marmite-src/assets/img/svg')],
                use: [
                    {
                        loader: 'svg-sprite-loader',
                        options: {
                            extract: true,
                            spriteFilename: 'img/svg/icon-sprite.svg',
                        },
                    },
                ],
            },
        ]
    },

    plugins: [
        ...htmlPlugins,
        new MiniCssExtractPlugin({
            filename: 'css/[name].min.css',
        }),
        new SpriteLoaderPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './marmite-src/assets/img'),
                    to: 'img',
                },
                {
                    from: path.resolve(__dirname, './marmite-src/assets/fonts'),
                    to: 'fonts',
                },
                {
                    from: path.resolve(__dirname, './marmite-src/assets/audios'),
                    to: 'audios',
                },
            ],
        }),
        {
            apply: (compiler) => {
                compiler.hooks.watchRun.tap('WatchRun', (compilation) => {
                    console.log('📂 A modification has been detected, recompilation in progress...');
                });

                compiler.hooks.done.tap('Done', (stats) => {
                    setTimeout(() => {
                        console.log(`✅ Recompilation terminée en ${stats.endTime - stats.startTime}ms`);
                    }, 50);
                });
            }
        }
    ],

    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin({
               test:  /\.js(\?.*)?$/i
            }),
        ],
    },

    watch: true,

    watchOptions: {
        ignored: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, 'marmite-dist'),
        ],
        aggregateTimeout: 300,
        poll: 1000,
    },

    performance: {
        hints: false,
    },

    mode: 'production'
}