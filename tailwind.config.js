/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        justi: {
          topbar: '#5492C6',
          headerBg: '#DCEAF7',
          bodyBg: '#E6F0FA',
          titleBar: '#EAF2FA',
          navy: '#1B5688',
          tableHeader: '#4E8EC2',
          totalsBar: '#80AED8',
          filterBar: '#B7B2A3',
          rowEven: '#E5E5F7',
          rowOdd: '#F4F4FB',
          tileBg: '#D3E7F8',
          tileBorder: '#9CC2E5',
          activeOrange: '#E06D1A',
        },
      },
    },
  },
  plugins: [],
};
