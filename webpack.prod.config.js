var config = require('./webpack.config.js');
var webpack = require('webpack');

config.plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.AggressiveMergingPlugin(),
  new webpack.DefinePlugin({
    NODE_ENV: JSON.stringify("production")
  })
);

module.exports = config;
