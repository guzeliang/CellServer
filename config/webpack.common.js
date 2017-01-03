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
        'moment': 'moment',
        vendor: [
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
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file?name=images/[name].[hash].[ext]'
            },
            {
                test: /\.css$/,
                include: helpers.root('src', 'css'),
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
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
            template: 'src/index.html'
        })
    ]
};