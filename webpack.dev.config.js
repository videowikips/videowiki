const webpack = require('webpack')
const glob = require('glob');
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const PurifyCSSPlugin = require('purifycss-webpack');

module.exports = {
  entry: [
    'babel-polyfill',
    'webpack/hot/only-dev-server',
    './client/src/app.js',
  ],

  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public'),
    publicPath: 'http://localhost:8080/',
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
      filename: 'public/style.css',
      allChunks: true,
    }),

    // Make sure this is after ExtractTextPlugin!
    new PurifyCSSPlugin({
      // Give paths to parse for rules. These should be absolute!
      paths: glob.sync(path.join(__dirname, 'public/*.html')),
    }),
    new BundleAnalyzerPlugin(),
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
      test: /\.(jpe?g|png|gif|svg|woff|woff2|eot|ttf)$/,
      loader: 'url-loader',
    }],
  },
}
