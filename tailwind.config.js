/** @type {import('tailwindcss').Config} */
export default {
    content: [
          "./index.html",
          "./src/**/*.{js,ts,jsx,tsx}",
        ],
    theme: {
          extend: {
                  fontFamily: {
                            sans: ['Inter', 'system-ui', 'sans-serif'],
                  },
                  colors: {
                            emerald: {
                                        50: '#ecfdf5',
                                        100: '#d1fae5',
                                        200: '#a7f3d0',
                                        300: '#6ee7b7',
                                        400: '#34d399',
                                        500: '#10b981',
                                        600: '#059669',
                                        700: '#047857',
                                        800: '#065f46',
                                        900: '#064e3b',
                            },
                  },
          },
    },
    plugins: [
          require('@tailwindcss/typography'),
        ],
    safelist: [
          'bg-emerald-50', 'bg-emerald-100', 'text-emerald-600', 'text-emerald-700',
          'bg-teal-50', 'bg-teal-100', 'text-teal-600',
          'bg-blue-50', 'bg-blue-100', 'text-blue-600',
          'bg-purple-50', 'bg-purple-100', 'text-purple-600',
          'bg-amber-50', 'bg-amber-100', 'text-amber-600', 'text-amber-700', 'border-amber-200',
          'bg-green-50', 'bg-green-100', 'text-green-600', 'text-green-700', 'border-green-200',
          'bg-red-50', 'bg-red-100', 'text-red-600', 'text-red-700', 'border-red-200',
        ],
}
