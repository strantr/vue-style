const path = require('path');

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve("./dist"),
        filename: "bundle.js",
        libraryTarget: "commonjs2"
    },
    externals: {
        vue: "vue"
    },
    resolve: {
        extensions: [".ts", ".js"]
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