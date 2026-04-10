import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    darkMode: 'class',

    theme: {
        extend: {
            fontFamily: {
                sans: ['DM Sans', ...defaultTheme.fontFamily.sans],
                mono: ['DM Mono', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                brand: {
                    50:  '#EDFBF4',
                    100: '#D0F7E5',
                    200: '#A2EFCC',
                    300: '#6DE2AF',
                    400: '#3DCE93',
                    500: '#00B679',
                    600: '#009D69',
                    700: '#008A5C',
                    800: '#006B47',
                    900: '#004F34',
                    950: '#003324',
                },
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
            },
        },
    },

    plugins: [forms],
};
