var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

var port = process.env.IOT_PORT || 6003;

module.exports = webpackMerge(commonConfig, {
    devtool: 'cheap-module-eval-source-map',

    output: {
        path: "",
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },

    plugins: [
        new ExtractTextPlugin('[name].css'),
        new webpack.DefinePlugin({
            'process.env': {
                'PORT': JSON.stringify(port)
            }
        })
    ],

    devServer: {
        historyApiFallback: true,
        stats: 'minimal',
        proxy: [{
            context: ['/bar', '/baz', '/foo', '/api', ],
            target: 'http://localhost:8103',
            secure: false
        }]
    }
});