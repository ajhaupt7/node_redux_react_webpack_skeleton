var path = require("path");
var webpack = require("webpack");
var autoprefixer = require('autoprefixer');

module.exports = {
  entry: "./index",
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    filename: "./static/bundle.js"
  },
  devtool: 'eval-source-map',
  postcss: function () {
    return [autoprefixer];
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass'],
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$|\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$/,
        loader: 'url?limit=50000&name=static/assets/[name].[ext]',
      }
    ] 
  },
  plugins: [

  ]
}