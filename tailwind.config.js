// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // 关键：指定需要扫描的 Vue 模板文件路径
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 扫描 src 下所有 Vue/JS/TS 等文件
  ],
  theme: {
    extend: {
      // 你的自定义颜色配置
      colors: {
        primary: '#165DFF',
        secondary: '#36CFC9',
        success: '#52C41A',
        warning: '#FAAD14',
        danger: '#FF4D4F',
        info: '#8C8C8C',
        light: 'rgb(232 243 255)',
        dark: '#1D2129',
      },
      // 你的自定义字体配置
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}