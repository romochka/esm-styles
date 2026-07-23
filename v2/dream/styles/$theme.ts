// Воображаемый сгенерированный справочник (из media.theme в конфиге).
// В стилях доступен как глобальный $theme — без импорта: среду исполнения
// предоставляет компилятор esm-styles (для IDE — esm-styles-env.d.ts).
// Каждый токен — обычная строка 'var(--…)', поэтому работает и значением,
// и в шаблонных строках. Никакого .var.

export default {
  paper: {
    /** light `#ffffff` · dark `#16161a` */
    bright: 'var(--theme-paper-bright)',
    /** light `#f4f1ea` · dark `#1e1e24` */
    tinted: 'var(--theme-paper-tinted)',
  },
  ink: {
    /** light `#1a1a1a` · dark `#ececf1` */
    strong: 'var(--theme-ink-strong)',
    /** light `#6b6b6b` · dark `#9a9aa3` */
    mild: 'var(--theme-ink-mild)',
    /** light `#dcdcd4` · dark `#2c2c33` */
    faint: 'var(--theme-ink-faint)',
  },
  /** light `#c24d2c` · dark `#e07a5f` */
  accent: 'var(--theme-accent)',
}
