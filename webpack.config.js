var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpackConfig = {
    entry: {
        index: path.join(__dirname, 'src/index.js'),
    },
    output: {
        path: path.join(__dirname, 'docs/asset'),
        filename: 'index.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            __DEV__: process.env.DEV || 'false',
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            inject: 'body',
            filename: '../index.html',
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: 'src/template.html',
            inject: 'body',
            filename: 'template.html',
            chunks: []
        }),
        new CopyWebpackPlugin([{
            from: "src/font",
            to: "font"
        },{
            from: "src/CNAME",
            to: "../"
        }]),
    ],
    module:{
        loaders: [
            {
               test: /\.html$/,
               loader: "raw-loader"
            },
            {
               test: /\.json$/,
               loader: "json-loader"
            }
        ]
    }
};
module.exports = webpackConfig