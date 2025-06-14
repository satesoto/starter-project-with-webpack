const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // Sebenarnya output.clean sudah cukup
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  mode: 'production',
  optimization: { // Tambahkan optimasi untuk produksi
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: [ // Pastikan ini tidak mengambil CSS dari node_modules jika MiniCssExtractPlugin tidak diinginkan untuknya
          path.resolve(__dirname, 'node_modules'),
        ],
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // new CleanWebpackPlugin(), // Tidak perlu jika output.clean = true di common
    new MiniCssExtractPlugin({
      filename: 'assets/styles/[name].[contenthash].css', // Simpan CSS di folder assets/styles
    }),
  ],
});