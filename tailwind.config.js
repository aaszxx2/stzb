/** @type {import('tailwindcss').Config} */
// TailwindCSS 配置文件
// 文档：https://tailwindcss.com/docs/configuration
export default {
  // 扫描 Vue 文件和 index.html 中的类名
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],

  // 主题配置
  theme: {
    extend: {
      // 品牌色板（沿用原项目的深蓝+金色配色）
      colors: {
        // 主色：深蓝
        navy: {
          DEFAULT: '#172b3d',
          light: '#233c50',
          dark: '#0f1d2a',
        },
        // 强调色：金色
        gold: {
          DEFAULT: '#d6a64f',
          light: '#fbf5e9',
          dark: '#b8893a',
        },
        // 收入绿
        income: {
          DEFAULT: '#218567',
          light: '#e9f5ef',
        },
        // 支出红
        expense: {
          DEFAULT: '#bc6357',
          light: '#fbefed',
        },
        // 中性色
        ink: '#1e2935',
        muted: '#778391',
        line: '#e4e9ee',
        paper: '#f4f6f8',
      },

      // 字体
      fontFamily: {
        sans: ['"Microsoft YaHei"', '"PingFang SC"', 'Aptos', 'Arial', 'sans-serif'],
      },

      // 圆角
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },

      // 阴影
      boxShadow: {
        'card': '0 3px 14px rgba(23, 43, 61, 0.06)',
        'float': '0 12px 36px rgba(31, 47, 62, 0.07)',
      },

      // 动画
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-down': 'slide-down 0.25s ease-out',
      },
    },
  },

  // 插件
  plugins: [],
}
