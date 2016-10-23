var config = require('./webpack.config.js');
var webpack = require('webpack');

config.plugins.push(
  new webpack.DefinePlugin({
    NODE_ENV: JSON.stringify("development")
  })
);

module.exports = config;