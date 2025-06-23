const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");

module.exports = {
  entry: {
    app: path.resolve(__dirname, "src/scripts/index.js"),
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[name][ext]",
        },
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, "node_modules")],
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      favicon: path.resolve(__dirname, "src/public/icons/favicon.png"),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/public/"),
          to: path.resolve(__dirname, "dist/"),
        },
        {
          from: path.resolve(__dirname, "src/scripts/sw-custom.js"),
          to: path.resolve(__dirname, "dist/"),
        },
      ],
    }),
    new GenerateSW({
      swDest: "sw.js",
      clientsClaim: true,
      skipWaiting: true,
      importScripts: ["./sw-custom.js"],
      runtimeCaching: [
        {
          // --- PERUBAHAN DI SINI ---
          // Hanya cache permintaan ke endpoint /stories
          urlPattern: new RegExp("^https://story-api.dicoding.dev/v1/stories"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "story-api-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // Aturan untuk gambar tetap sama
          urlPattern: ({ url }) => url.href.startsWith("https://story-api.dicoding.dev/images/"),
          handler: "CacheFirst",
          options: {
            cacheName: "story-image-cache",
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 30 * 24 * 60 * 60,
            },
          },
        },
      ],
    }),
  ],
};