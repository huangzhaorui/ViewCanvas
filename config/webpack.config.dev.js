const path = require("path");
const webpack = require("webpack");
const htmlWebpackPlugin = require('html-webpack-plugin');   //导入插件

module.exports = {
    mode: 'development',
    entry: {
        main: './src/main.js'
    },
    devServer: {
        contentBase: path.join(__dirname, '../public'),
        compress: true,
        hot: true,
        open: true,
        port: 4000,
        // host: '0.0.0.0'
    },
    output: {
        filename: 'ViewCanvas.js',
        //绝对路径
        path: path.resolve(__dirname, '../dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['stage-0']
                    }
                }],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            },
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new htmlWebpackPlugin({   //创建一个在内存中生成html页面的插件
            template: path.join(__dirname, '../public/index.html'),   //指定模板页面
            filename: "index.html"
        })
    ]
}
