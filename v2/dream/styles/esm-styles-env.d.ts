// Воображаемый сгенерированный файл окружения (аналог vite/client).
// Его целиком порождает и обновляет watcher esm-styles — руками не трогать.
//
// 1. Справочники — ambient-глобалы: среда исполнения стилей даёт их сама.
// 2. Markup — скелеты разметки, извлечённые из .tsx-половинок пар.
//    Нотация та же, что в стилях: тег — элемент, camelCase — класс,
//    PascalCase — граница компонента. Скелет — это стиль без свойств.
// 3. StyleOf<M> разрешает на каждом узле скелета: CSS-свойства (csstype),
//    классы и состояния из M, псевдоклассы, '@…'-запросы и сокращённые
//    пути (потомки без захода за PascalCase-границы).

declare const $theme: (typeof import('./$theme'))['default']
declare const $device: (typeof import('./$device'))['default']

// Слой 1 уже настоящий: типы значений из v2/src/types.ts
// (в опубликованном пакете путь станет просто 'esm-styles').
type StyleOf<M> = import('../../src/types').StyleOf<M>
type GlobalStyle = import('../../src/types').GlobalStyle

declare namespace Markup {
  /** app/layout.tsx */
  interface Layout {
    body: {
      header: { a: { logo: {} }; Nav: {} }
      footer: { small: {} }
    }
  }

  /** components/nav.tsx */
  interface Nav {
    nav: {
      open: {}
      button: {}
      ul: { li: { a: { active: {} } } }
    }
  }

  /** components/story.tsx */
  interface Story {
    article: {
      compact: {}
      urgent: {}
      header: { h1: {}; p: {} }
      Byline: {}
      main: { img: {}; p: {} }
      footer: { a: {} }
    }
  }

  /** components/byline.tsx */
  interface Byline {
    address: { img: {}; b: {}; time: {} }
  }

  /** components/gallery.tsx */
  interface Gallery {
    figure: { img: {}; figcaption: {} }
  }

  /** app/page.tsx */
  interface HomePage {
    main: {
      h2: {}
      section: { feed: {}; Story: {} }
    }
  }

  /** app/story/[slug]/page.tsx */
  interface StoryPage {
    main: {
      Story: {}
      Gallery: {}
      nav: { related: {}; h3: {}; Story: {} }
    }
  }

  /** app/archive/page.tsx */
  interface ArchivePage {
    main: {
      h2: {}
      section: { h3: {}; ul: { li: { a: {}; time: {} } } }
    }
  }
}
