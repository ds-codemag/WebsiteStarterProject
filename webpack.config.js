// Imports
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const merge = require('webpack-merge');

// Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Variables
const devMode = process.env.NODE_ENV !== 'production';
const entry = () => {
    return glob.sync('./src/js/*.js').reduce(
        function (prev, curr) {
            prev[path.basename(curr, '.js')] = curr;
            return prev;
        }, {}
    );
};
// Common configuration
module.exports = {
    target: 'web',
    mode: process.env.NODE_ENV,
    devtool: devMode ? 'inline-source-map' : 'none',
    entry: entry(),
    output: {
        filename: devMode ? 'js/[name].bundle.js' : 'js/[name].bundle.js?[hash]',
        path: path.resolve(__dirname, 'build')
    },
    module: {
        rules: [
            { // Loading JS
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }
            },
            { // Loading CSS
                test: /\.css$/,
                use: [
                    devMode ? {
                        loader: 'style-loader',
                        options: {sourceMap: true}
                    } : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            { // Loading SCSS
                test: /\.scss$/,
                use: [
                    devMode ? {
                        loader: 'style-loader',
                        options: {sourceMap: true}
                    } : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            importLoaders: 2
                        }
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            plugins: [
                                require('autoprefixer')({
                                    grid: true
                                })
                            ]
                        }
                    }, {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            { // Loading Images
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name() {
                                if (devMode) {
                                    return '[name].[ext]';
                                }
                                return '[name].[ext]?[hash]';
                            },
                            outputPath: devMode ? 'images/' : '/images/'
                        }
                    }, {
                        loader: 'image-webpack-loader',
                        options: {
                            svgo: {
                                plugins: [
                                    {
                                        cleanupIDs: false
                                    }
                                ]
                            }
                        }
                    }
                ]
            },
            { // Loading Fonts
                test: /\.(woff|woff2|ttf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name() {
                                if (devMode) {
                                    return '[name].[ext]';
                                }
                                return '[name].[ext]?[hash]';
                            },
                            outputPath: devMode ? 'fonts/' : '/fonts/'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin([
            'build'
        ]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new CopyWebpackPlugin([
            {from: 'static'}
        ])
    ]
};

const templates = glob.sync('./src/*.html').map(function (val) {
    return path.basename(val, '.html');
});

for (let i = 0; i < templates.length; i++) {
    module.exports.plugins.push(new HtmlWebpackPlugin({
            filename: `${templates[i]}.html`,
            template: `./src/${templates[i]}.html`,
            chunks: [templates[i]]
        })
    );
}

if (devMode) { // Development

    module.exports = merge(module.exports, {
        devServer: {
            compress: true,
            contentBase: path.join(__dirname, 'build'),
            watchContentBase: true,
            watchOptions: {
                poll: true
            }
        }
    });

} else { // Production

    module.exports = merge(module.exports, {
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    uglifyOptions: {
                        output: {
                            comments: false
                        },
                        compress: {
                            unused: true,
                            dead_code: true,
                            side_effects: true
                        }
                    }
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorPluginOptions: {
                        preset: ['default', {discardComments: {removeAll: true}}]
                    }
                })
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: devMode ? 'css/[name].css' : 'css/[name].css?[hash]'
            })
        ]
    });
}
