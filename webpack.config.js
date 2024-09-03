const path = require('path');
const webpackNodeExternals = require('webpack-node-externals');
console.log(__dirname);
module.exports = {
    target: "node",
    externals: [webpackNodeExternals()],
    node: {
        __dirname: false,
      },
    entry: './app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [
                    path.resolve(__dirname, 'node_modules'), 
                    path.resolve(__dirname, 'config'),       
                    path.resolve(__dirname, '.env'),         
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.node$/,
                loader: "node-loader",
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
        ],
    },
    plugins: [],
    mode: 'development',
};