const webpack = require('webpack');
const path = require('path');
const srcDir = path.join(__dirname, './src');
const distDir = path.join(__dirname, './dist');

const env = process.env.NODE_ENV.trim()

module.exports = {
    mode: env === 'dev' ? 'development' : 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(distDir),
        filename: '[name].js',
    },
    devtool: env === 'dev' ? 'source-map' : null,
    module: {
        rules: [
            { 
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
    }
}
