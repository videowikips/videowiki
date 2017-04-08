const webpack = require('webpack')
const path = require('path')

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
  ],

  devtool: 'source-map',
  devServer: {
    contentBase: './public',
    proxy: {
      '/api/*': {
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
      test: /\.css$/,
      loader: 'style!css',
    }],
  },
}
