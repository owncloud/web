const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    plugins: [
        new VueLoaderPlugin(),
    ],
    entry: './src/default.js',
    output : {
        path: `${__dirname}/js`,
        chunkFilename: '[name].files.chunk.js',
        filename : "files.bundle.js",
        publicPath: 'apps/files/js/'
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /node_modules/,
        }, {
            enforce: 'pre',
            test: /\.(js|vue)$/,
            exclude: /node_modules/,
            loader: "eslint-loader",
        }, {
            test: /\.vue$/,
            loader: 'vue-loader'
        }, {
            test: /\.css$/,
            use: [
                'vue-style-loader',
                'css-loader'
            ]
        }]
    }
}
