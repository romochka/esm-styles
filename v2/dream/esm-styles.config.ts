// Воображаемый конфиг esm-styles v2 (design fiction, генератор подключим
// после утверждения прозы). Конфиг — только конфигурация: где лежат токены
// и как активируются режимы. Сами значения — по одному модулю на режим
// в tokens/<mode>.<collection>.ts (формат обмена с Figma: одна
// collection.mode → один файл). Из конфига и токенов генерируются
// $-справочники (JSDoc при hover — оттуда) и tokens.css (первый этаж).

import type { EsmStylesConfig } from '../src/types.ts'

export default {
  floors: [
    { name: 'global', include: 'global.styles.ts' },
    { name: 'layout', include: 'layout.styles.ts' },
    { name: 'components', include: 'components/' },
    { name: 'pages', include: 'pages/' },
  ],

  shortcuts: {
    '@mobile': '@media (max-width: 767px)',
    '@dark': '@media (prefers-color-scheme: dark)',
  },

  tokensPath: './tokens',

  collections: {
    theme: {
      // светло-тёмная ось: цвета один раз через light-dark(),
      // «auto» — нативное поведение color-scheme, отдельный режим не нужен
      colorScheme: true,

      modes: {
        // дефолт и канон структуры → tokens/light.theme.ts;
        // селектор — принудительно светлая при color-scheme: light dark
        light: { selector: '[data-theme="light"]' },
        dark: { selector: '[data-theme="dark"]' },
        twilight: { selector: '[data-theme="twilight"]', inherits: 'dark' },
      },
    },

    device: {
      modes: {
        mobile: {}, // дефолт, mobile-first → tokens/mobile.device.ts
        desktop: { media: '(min-width: 768px)' },
      },
    },
  },
} satisfies EsmStylesConfig
