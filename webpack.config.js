const path = require('path');

module.exports = {
  devtool: "source-map",
  entry: './src/globals.ts',
  output: {
    filename: 'dframe.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
      rules: [
        {
            test: /\.tsx?$/,
            loader: 'ts-loader'
        },
        {
          test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3|css)$/,
          loader: "file-loader",
          options: {
            name: '[name].[ext]'
          } 
        }
      ]
  },
  resolve: {
      extensions: [ '.ts', '.tsx', '.js' ]
  }
};