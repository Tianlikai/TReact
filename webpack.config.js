const webpack = require("webpack");
const path = require("path");
const srcDir = path.join(__dirname, "./src");
const distDir = path.join(__dirname, "./dist");

const env = process.env.NODE_ENV.trim();

module.exports = {
  mode: env === "dev" ? "development" : "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(distDir),
    filename: env === "dev" ? "[name].js" : "[name].min.js"
  },
  devtool: env === "dev" ? "source-map" : false,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    })
  ]
};
