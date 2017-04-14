const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: [
    'babel-polyfill',
    'webpack/hot/only-dev-server',
    './client/src/app.js',
  ],

  output: {
    filename: 'bundle.js',
    path: `${__dirname}/public/`,
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
      filename: 'public/style.css',
      allChunks: true,
    }),
  ],

  devtool: 'source-map',
  devServer: {
    contentBase: './public',
    proxy: {
      '/': {
        target: 'http://localhost:4000',
        secure: false,
      },
    },
  },

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      include: path.join(__dirname, 'client/src'),
      loaders: ['react-hot-loader', 'babel-loader'],
    }, {
      test: /\.scss$/,
      include: path.join(__dirname, 'client/src'),
      loaders: ['style-loader', 'css-loader', 'sass-loader'],
    }, {
      test: /\.css$/,
      loaders: ['style-loader', 'css-loader'],
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      loader: 'file-loader',
    }],
  },
}
