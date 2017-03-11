const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require("./webpack.config.js");
common.entry = "./dev/index.ts";
common.plugins = [new HtmlWebpackPlugin({
    template: "./dev/index.html"
})];
common.devServer = {
    host: "0.0.0.0",
    port: 8080,
    contentBase: "./src",
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    }
};
common.output.libraryTarget = "var";
common.devtool = "source-map";
module.exports = common;