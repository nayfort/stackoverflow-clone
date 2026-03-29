/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Вот тут было просто tailwindcss, это и ломало билд
    autoprefixer: {},
  },
};

export default config;