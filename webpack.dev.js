const path = require('path');
const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map', // Tambahkan source map untuk debugging
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: [ // Pastikan ini tidak mengambil CSS dari node_modules
          path.resolve(__dirname, 'node_modules'),
        ],
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 9000,
    open: true, // Buka browser otomatis
    client: {
      overlay: {
        errors: true,
        warnings: false, // Nonaktifkan overlay warning jika terlalu berisik
      },
    },
    historyApiFallback: true,
     // Penting untuk SPA dengan client-side routing
  },
});