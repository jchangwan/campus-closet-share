/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- 이 줄이 제일 중요합니다.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}