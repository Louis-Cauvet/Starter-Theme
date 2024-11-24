const path = require('path');             // Allows to manipulate files' path
const fs = require('fs');                               // Allows to interact with files' system

/******************************
 *   PLUGINS IMPORTS
 ****************************/
const CopyWebpackPlugin = require('copy-webpack-plugin');                              // Allows to copy repertories or files in a destination repertory
const HtmlWebpackPlugin = require("html-webpack-plugin");                              // Allows to generate HTML files from Twig files
const MiniCssExtractPlugin = require('mini-css-extract-plugin');                       // Allows to extract CSS files instead of including them in JS bundles
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');                    // Allows to minify CSS files
const ESLintPlugin = require('eslint-webpack-plugin');                                 // Allows to indicate syntax errors in JS files
const TerserPlugin = require('terser-webpack-plugin');                                 // Allows to minify JS files
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');      // Allows to generate SVG sprites for using SVG icons

/******************************
 *   PLUGIN CUSTOMIZATION
 ****************************/
function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));          // Getting all files in the repertory 'templateDir'

    return templateFiles.map(template => {                                                // For each file...
        const separateParts = path.parse(template);
        const templateName = separateParts.name;                                          // ... getting the file's name
        const templateExtension = separateParts.ext;                                      // ... getting the file's extension

        if (templateExtension === '.twig') {                                                    // If the file's extension is '.twig' ...
            return new HtmlWebpackPlugin({                                               // ... converting it in HTML file
                filename: `../pages/${templateName}.html`,
                template: path.resolve(__dirname, `${templateDir}/${templateName}${templateExtension}`),
                inject: false,          // No identification of loading resources in HTML files
                minify: false,          // No minification for HTML files
            });
        }
    }).filter(Boolean);
}

const htmlPlugins = generateHtmlPlugins('./marmite-src/views/pages');             // Using the custom plugin on all Twig files in 'marmite-src/views/pages'

/******************************
 *  ENTRY FILES TREATMENT
 ****************************/
module.exports = {
    entry: {
        styles: path.resolve(__dirname, './marmite-src/assets/scss/styles.scss'),               // Registering the main SCSS file
        print: path.resolve(__dirname, './marmite-src/assets/scss/print.scss'),                 // Registering the print SCSS file
        script: path.resolve(__dirname, './marmite-src/assets/js/script-front.js'),             // Registering the main JS file
        svgSprite: path.resolve(__dirname, './marmite-src/assets/js/svg-sprite.js')             // Registering the file which allows to generate the SVG sprite
    },

    output: {
        path: path.resolve(__dirname, './marmite-dist/assets'),                         // Indicating the output repertory for JS bundles
        filename: (pathData) => {
            return pathData.chunk.name === 'script'                                     // Compiling the main JS file in another repertory
                ? 'js/[name].min.js'
                : 'jsbundles/[name].bundle.js';
        },
        clean: true,                                     // Deletting the output repertory before generating news ones (for avoid to conserve outdated files)
    },

    module: {
        rules: [                                        // Defining rules for differents files' types
            {
                test: /\.twig$/,
                use: ['twig-loader']                     // Converting Twig to HTML
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,              // Extracting the CSS in a separate file (for loading the CSS files in parallel of JS files)
                    {
                        loader: 'css-loader',                // Allowing CSS to understand the 'imports' defined in SCSS
                        options: {
                            url: false,                      // Disabling automatic detection of files included in the SCSS with ‘url’.
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [require('autoprefixer')],         // Adding automatically prefixes in CSS code for multiple browsers' compatibility
                            },
                        },
                    },
                    'sass-loader'                           // Converting SCSS to CSS
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,                     // Excluding the repertory 'node_modules'
                use: [
                    {
                        loader: 'babel-loader',              // Converting modern JS in older browsers' compatible code
                        options: {
                            presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]],       // Including necessaries polyfills in JS
                            cacheDirectory: true                 // Adding cache for reduce file loading times
                        }
                    },
                ]
            },
            {
                test: /\.svg$/,
                include: [path.resolve(__dirname, './marmite-src/assets/img/svg')],       // Limiting to SVG in the repertory 'marmite-src/assets/img/svg'
                use: [
                    {
                        loader: 'svg-sprite-loader',                          // Creating an SVG sprite, for access to all of them with only one ressource loading
                        options: {
                            extract: true,                                    // Extracting the SVG sprite in a separate repertory
                            spriteFilename: 'img/svg/icon-sprite.svg',        // Defining the SVG sprite's name
                        },
                    },
                ],
            },
        ]
    },

    plugins: [
        ...htmlPlugins,                                         // Compiling Twig files in HTML files
        new MiniCssExtractPlugin({                       // Extracting CSS files in another repertory
            filename: 'css/[name].min.css',
        }),
        new ESLintPlugin({                              // Analizing Js syntax for write warnings
            emitWarning: true,                                 // Writing warning in the terminal
        }),
        new SpriteLoaderPlugin(),                              // Extracting all SVG in the same sprite
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './marmite-src/assets/img'),        // Transferring 'assets/img' repertory in 'marmite-dist'
                    to: 'img',
                },
                {
                    from: path.resolve(__dirname, './marmite-src/assets/fonts'),      // Transferring 'assets/fonts' repertory in 'marmite-dist'
                    to: 'fonts',
                },
                {
                    from: path.resolve(__dirname, './marmite-src/assets/audios'),      // Transferring 'assets/audios' repertory in 'marmite-dist'
                    to: 'audios',
                },
            ],
        }),
        {
            apply: (compiler) => {
                compiler.hooks.watchRun.tap('WatchRun', (compilation) => {             // Defining a custom message when the Webpack compilation starts
                    console.log('📂 A modification has been detected, recompilation in progress...');
                });

                compiler.hooks.done.tap('Done', (stats) => {                         // Defining a custom message when the Webpack compilation was finished
                    setTimeout(() => {
                        console.log(`✅  Recompilation finished in ${stats.endTime - stats.startTime}ms`);
                    }, 50);
                });
            }
        }
    ],

    optimization: {
        minimize: true,                      // Activating code's minification
        minimizer: [
            new CssMinimizerPlugin(),        // Minifying CSS files
            new TerserPlugin({        // Minifying JS files
               test:  /\.js(\?.*)?$/i
            }),
        ],
    },

    cache: {
        type: 'filesystem',              // Uses a cache based on the file system
        buildDependencies: {
            config: [__filename],
        },
    },

    watch: true,                                                // Activating the Webpack's watch mode

    watchOptions: {                                             // Defining Webpack's watch mode options
        ignored: [                                              // Defining the repertories which don't need to be observed by Webpack's watch mode
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, 'marmite-dist'),
        ],
        aggregateTimeout: 300,                                // Defining the minimal time between 2 compilations
        poll: 1000,                                           // Defining the time between 2 checking of Webpack's watch mode
    },

    performance: {
        hints: false,                                         // Deactivating warnings linked to performances
    },

    mode: 'production',                                   // Defining the Webpack's 'production' mode, for activating minification and files' monitoring (watch mode)
}