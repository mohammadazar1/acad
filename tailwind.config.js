module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        background: '#F9FAFB',
        text: '#1F2937',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Tajawal', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

