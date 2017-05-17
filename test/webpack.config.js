const path = require('path');

module.exports = {
    entry: {
        test: "./test/index.ts"
    },
    output: {
        path: path.resolve("./test"),
        filename: "bundle.js"
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        },
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            }
        ]
    }
}