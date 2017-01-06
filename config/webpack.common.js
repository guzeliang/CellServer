var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

//当webpack加载到某个js模块里，出现了未定义且名称符合（字符串完全匹配）配置中key的变量时，会自动require配置中value所指定的js模块。
var providePlugin = new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    'window.$': 'jquery'
});

var helpers = require('./helpers');

module.exports = {
    entry: {
        'lodash': 'lodash',
        'ng2-pagination': 'ng2-pagination',
        'chart': 'chart.js',
        vendor: [
            'moment',
            'bootstrap',
            'zone.js',
            'jquery',
            'rxjs',
            'reflect-metadata',
            'es6-shim',
            'es6-promise',
        ],
        '@angular2': [
            "@angular/common",
            "@angular/compiler",
            "@angular/core",
            "@angular/forms",
            "@angular/http",
            "@angular/platform-browser",
            "@angular/platform-browser-dynamic",
            "@angular/router",
            "@angular/upgrade"
        ],
        app: './src/js/main.ts'
    },

    resolve: {
        extensions: ['', '.js', '.ts'],
        alias: {}
    },

    module: {
        loaders: [{
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.(svg|woff|woff2|ttf|eot)$/,
                loader: 'file?name=assets/[name].[hash].[ext]'
            },
            {
                test: /\.(png|jpe?g|gif|ico)$/,
                loader: 'file-loader?name=images/[name].[ext]'
            },
            {
                test: /\.css$/,
                include: helpers.root('src', 'css'),
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
            }, ,
            {
                test: /\.css$/,
                include: helpers.root('src', 'js'),
                loader: 'raw'
            },
            {
                test: require.resolve('jquery'), // 此loader配置项的目标是NPM中的jquery
                loader: 'expose?$!expose?jQuery', // 先把jQuery对象声明成为全局变量`jQuery`，再通过管道进一步又声明成为全局变量`$`
            }

        ]
    },

    plugins: [
        providePlugin,
        new HtmlWebpackPlugin({
            favicon: 'src/favicon.ico',
            template: 'src/index.html'
        })
    ]
};