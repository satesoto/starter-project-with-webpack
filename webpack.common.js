const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");

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
      favicon: path.resolve(__dirname, "src/public/icons/favicon.png"), // Menggunakan ikon yang sama untuk favicon
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/public/"),
          to: path.resolve(__dirname, "dist/"),
          // Abaikan folder icons dan file manifest.json karena sudah di-handle oleh WebpackPwaManifest
          globOptions: {
            ignore: ["**/icons/**", "**/manifest.json"],
          },
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
          urlPattern: ({ url }) => url.href.startsWith("https://story-api.dicoding.dev/v1/"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "story-api-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ url }) => url.href.startsWith("https://story-api.dicoding.dev/images/"),
          handler: "CacheFirst",
          options: {
            cacheName: "story-image-cache",
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
            },
          },
        },
      ],
    }),
    new WebpackPwaManifest({
      // Opsi ini akan digunakan untuk membuat manifest.json secara otomatis
      name: "CeritaKita - Berbagi Cerita",
      short_name: "CeritaKita",
      description: "Aplikasi untuk berbagi cerita dan pengalaman Anda dengan dunia.",
      background_color: "#ffffff",
      theme_color: "#2563EB",
      start_url: ".", // Plugin akan secara otomatis menggabungkannya dengan publicPath
      display: "standalone",
      publicPath: ".", // Menyesuaikan path agar cocok dengan struktur output
      icons: [
        {
          src: path.resolve(__dirname, "src/public/icons/favicon.png"),
          sizes: [96, 128, 192, 256, 384, 512],
          purpose: "any maskable",
          destination: "assets/icons", // Menyimpan ikon di folder assets/icons
        },
      ],
    }),
  ],
};
