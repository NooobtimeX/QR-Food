export default defineNuxtConfig({
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  css: ["~/assets/main.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    },
  },

  devServer: {
    port: 3000,
  },

  nitro: {
    serveStatic: true, // Enable static serving
    publicAssets: [
      {
        dir: "/app/public/photos", // Maps /photos to the photo-storage volume in Docker
        baseURL: "/photos",
      },
    ],
  },

  modules: ["@nuxtjs/google-fonts"],
  googleFonts: {
    families: {
      "Chakra+Petch": [300, 400, 500, 600, 700], // Add the desired font weights
    },
    display: "swap", // Optional: control font-display
    preload: true, // Optional: preload fonts for faster loading
  },
  compatibilityDate: "2024-08-27",
});
