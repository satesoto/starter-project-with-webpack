const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Menambahkan clean untuk output directory
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i, // Menambahkan svg
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]', // Menyimpan gambar di folder assets/images
        },
      },
      { // Aturan baru untuk CSS dari node_modules (misal: leaflet.css)
        test: /\.css$/,
        include: [
          path.resolve(__dirname, 'node_modules'),
        ],
        use: [
          'style-loader', // Atau MiniCssExtractPlugin.loader untuk produksi
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      favicon: path.resolve(__dirname, 'src/public/favicon.png'), // Menambahkan favicon
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
          globOptions: {
            ignore: ['**/index.html'], // Abaikan index.html karena sudah dihandle HtmlWebpackPlugin
          },
        },
      ],
    }),
  ],
};