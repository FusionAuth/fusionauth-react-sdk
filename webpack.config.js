const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: path.join(__dirname, './src/index.js'),
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.json'],
        fallback: {
            util: false,
        },
        alias: {
            react: path.resolve('./node_modules/react'),
        },
    },
    externals: [nodeExternals()],
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs',
    },
    plugins: [new CleanWebpackPlugin()],
    devServer: {
        inline: false,
        contentBase: './dist',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
                include: path.resolve(__dirname, './src'),
            },
        ],
    },
};
