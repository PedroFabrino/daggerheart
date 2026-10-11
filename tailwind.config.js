/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          surface: 'var(--color-bg-surface)',
          hover: 'var(--color-bg-hover)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          highlight: 'var(--color-border-highlight)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        hope: {
          DEFAULT: 'var(--color-hope)',
          light: 'var(--color-hope-light)',
          dark: 'var(--color-hope-dark)',
        },
        fear: {
          DEFAULT: 'var(--color-fear)',
          light: 'var(--color-fear-light)',
          dark: 'var(--color-fear-dark)',
        },
        domain: {
          arcana: 'var(--color-domain-arcana)',
          blade: 'var(--color-domain-blade)',
          bone: 'var(--color-domain-bone)',
          codex: 'var(--color-domain-codex)',
          dread: 'var(--color-domain-dread)',
          grace: 'var(--color-domain-grace)',
          midnight: 'var(--color-domain-midnight)',
          sage: 'var(--color-domain-sage)',
          splendor: 'var(--color-domain-splendor)',
          valor: 'var(--color-domain-valor)',
        },
      },
    },
  },
  plugins: [],
};
