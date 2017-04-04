module.exports = {
  context: __dirname + "/client",

  entry: "./src/app.js",

  output: {
    filename: "bundle.js",
    path: __dirname + "/public/js",
  },

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loaders: ["react-hot-loader", "babel-loader"]
    }]
  }
};
