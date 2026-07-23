// Сгенерировано esm-styles v2 (v2/src/gen.ts) — руками не редактировать.
// Перегенерация: npm run gen:v2 (или npm run watch:v2)
//
// 1. Справочники — ambient-глобалы: среда исполнения стилей даёт их сама.
// 2. Markup — скелеты разметки, извлечённые из .tsx-половинок пар.
//    Нотация та же, что в стилях: тег — элемент, camelCase — класс,
//    PascalCase — граница компонента. Скелет — это стиль без свойств.
//    Сокращённые пути развёрнуты; зоны контента — в свободном режиме.

declare const $device: (typeof import('./$device'))['default']
declare const $theme: (typeof import('./$theme'))['default']

type StyleOf<M> = import('../../src/types').StyleOf<M>
type GlobalStyle = import('../../src/types').GlobalStyle

declare namespace Markup {
  type Css = import('../../src/types').CssProperties
  type CssValue = import('../../src/types').CssValue
  type Special<S> = import('../../src/types').SpecialKeys<S>
  type Boundary = import('../../src/types').Boundary
  type Free = import('../../src/types').Style
  type Keyframes = import('../../src/types').Keyframes
  type PropertyRule = import('../../src/types').PropertyRule

  /** app/archive/page.tsx */
  interface ArchivePage {
    main: ArchivePage.main
    [k: `@keyframes ${string}`]: Keyframes
    [k: `@property --${string}`]: PropertyRule
  }
  namespace ArchivePage {
    interface main extends Css, Special<main> {
      [k: `${string},${string}`]: main | main_h2 | main_section | main_section_h3 | main_section_ul | main_section_ul_li | main_section_ul_li_a | main_section_ul_li_time | undefined
      h2?: main_h2
      section?: main_section
      h3?: main_section_h3
      ul?: main_section_ul
      li?: main_section_ul_li
      a?: main_section_ul_li_a
      time?: main_section_ul_li_time
    }
    interface main_h2 extends Css, Special<main_h2> {
      [k: `${string},${string}`]: main_h2 | undefined
    }
    interface main_section extends Css, Special<main_section> {
      [k: `${string},${string}`]: main_section | main_section_h3 | main_section_ul | main_section_ul_li | main_section_ul_li_a | main_section_ul_li_time | undefined
      h3?: main_section_h3
      ul?: main_section_ul
      li?: main_section_ul_li
      a?: main_section_ul_li_a
      time?: main_section_ul_li_time
    }
    interface main_section_h3 extends Css, Special<main_section_h3> {
      [k: `${string},${string}`]: main_section_h3 | undefined
    }
    interface main_section_ul extends Css, Special<main_section_ul> {
      [k: `${string},${string}`]: main_section_ul | main_section_ul_li | main_section_ul_li_a | main_section_ul_li_time | undefined
      li?: main_section_ul_li
      a?: main_section_ul_li_a
      time?: main_section_ul_li_time
    }
    interface main_section_ul_li extends Css, Special<main_section_ul_li> {
      [k: `${string},${string}`]: main_section_ul_li | main_section_ul_li_a | main_section_ul_li_time | undefined
      a?: main_section_ul_li_a
      time?: main_section_ul_li_time
    }
    interface main_section_ul_li_a extends Css, Special<main_section_ul_li_a> {
      [k: `${string},${string}`]: main_section_ul_li_a | undefined
    }
    interface main_section_ul_li_time extends Css, Special<main_section_ul_li_time> {
      [k: `${string},${string}`]: main_section_ul_li_time | undefined
    }
  }

  /** app/layout.tsx */
  interface Layout {
    body: Layout.body
    [k: `@keyframes ${string}`]: Keyframes
    [k: `@property --${string}`]: PropertyRule
  }
  namespace Layout {
    interface body extends Css, Special<body> {
      [k: `${string},${string}`]: body | body_header | body_footer | body_header_a | body_footer_small | undefined
      header?: body_header
      footer?: body_footer
      a?: body_header_a
      small?: body_footer_small
    }
    interface body_header extends Css, Special<body_header> {
      [k: `${string},${string}`]: body_header | Boundary | body_header_a | undefined
      Nav?: Boundary
      a?: body_header_a
    }
    interface body_header_a extends Css, Special<body_header_a> {
      [k: `${string},${string}`]: body_header_a | undefined
      logo?: body_header_a
    }
    interface body_footer extends Css, Special<body_footer> {
      [k: `${string},${string}`]: body_footer | body_footer_small | undefined
      small?: body_footer_small
    }
    interface body_footer_small extends Css, Special<body_footer_small> {
      [k: `${string},${string}`]: body_footer_small | undefined
    }
  }

  /** app/page.tsx */
  interface HomePage {
    main: HomePage.main
    [k: `@keyframes ${string}`]: Keyframes
    [k: `@property --${string}`]: PropertyRule
  }
  namespace HomePage {
    interface main extends Css, Special<main> {
      [k: `${string},${string}`]: main | main_h2 | main_section | undefined
      h2?: main_h2
      section?: main_section
    }
    interface main_h2 extends Css, Special<main_h2> {
      [k: `${string},${string}`]: main_h2 | undefined
    }
    interface main_section extends Css, Special<main_section> {
      [k: `${string},${string}`]: main_section | Boundary | undefined
      feed?: main_section
      Story?: Boundary
    }
  }

  /** app/story/[slug]/page.tsx */
  interface StoryPage {
    main: StoryPage.main
    [k: `@keyframes ${string}`]: Keyframes
    [k: `@property --${string}`]: PropertyRule
  }
  namespace StoryPage {
    interface main extends Css, Special<main> {
      [k: `${string},${string}`]: main | Boundary | main_section | main_nav | main_nav_h3 | undefined
      Story?: Boundary
      Gallery?: Boundary
      section?: main_section
      nav?: main_nav
      h3?: main_nav_h3
    }
    interface main_section extends Css, Special<main_section> {
      [key: string]: Free | CssValue | main_section | undefined
      prose?: main_section
    }
    interface main_nav extends Css, Special<main_nav> {
      [k: `${string},${string}`]: main_nav | Boundary | main_nav_h3 | undefined
      related?: main_nav
      Story?: Boundary
      h3?: main_nav_h3
    }
    interface main_nav_h3 extends Css, Special<main_nav_h3> {
      [k: `${string},${string}`]: main_nav_h3 | undefined
    }
  }

  /** components/byline.tsx */
  interface Byline {
    address: Byline.address
    [k: `@keyframes ${string}`]: Keyframes
    [k: `@property --${string}`]: PropertyRule
  }
  namespace Byline {
    interface address extends Css, Special<address> {
      [k: `${string},${string}`]: address | address_img | address_b | address_time | undefined
      img?: address_img
      b?: address_b
      time?: address_time
    }
    interface address_img extends Css, Special<address_img> {
      [k: `${string},${string}`]: address_img | undefined
    }
    interface address_b extends Css, Special<address_b> {
      [k: `${string},${string}`]: address_b | undefined
    }
    interface address_time extends Css, Special<address_time> {
      [k: `${string},${string}`]: address_time | undefined
    }
  }

  /** components/gallery.tsx */
  interface Gallery {
    figure: Gallery.figure
    [k: `@keyframes ${string}`]: Keyframes
    [k: `@property --${string}`]: PropertyRule
  }
  namespace Gallery {
    interface figure extends Css, Special<figure> {
      [k: `${string},${string}`]: figure | figure_img | figure_figcaption | undefined
      img?: figure_img
      figcaption?: figure_figcaption
    }
    interface figure_img extends Css, Special<figure_img> {
      [k: `${string},${string}`]: figure_img | undefined
    }
    interface figure_figcaption extends Css, Special<figure_figcaption> {
      [k: `${string},${string}`]: figure_figcaption | undefined
    }
  }

  /** components/nav.tsx */
  interface Nav {
    nav: Nav.nav
    [k: `@keyframes ${string}`]: Keyframes
    [k: `@property --${string}`]: PropertyRule
  }
  namespace Nav {
    interface nav extends Css, Special<nav> {
      [k: `${string},${string}`]: nav | nav_button | nav_ul | nav_ul_li | nav_ul_li_a | undefined
      open?: nav
      button?: nav_button
      ul?: nav_ul
      li?: nav_ul_li
      a?: nav_ul_li_a
    }
    interface nav_button extends Css, Special<nav_button> {
      [k: `${string},${string}`]: nav_button | undefined
    }
    interface nav_ul extends Css, Special<nav_ul> {
      [k: `${string},${string}`]: nav_ul | nav_ul_li | nav_ul_li_a | undefined
      li?: nav_ul_li
      a?: nav_ul_li_a
    }
    interface nav_ul_li extends Css, Special<nav_ul_li> {
      [k: `${string},${string}`]: nav_ul_li | nav_ul_li_a | undefined
      a?: nav_ul_li_a
    }
    interface nav_ul_li_a extends Css, Special<nav_ul_li_a> {
      [k: `${string},${string}`]: nav_ul_li_a | undefined
      active?: nav_ul_li_a
    }
  }

  /** components/story.tsx */
  interface FullComponent {
    div: FullComponent.div
    [k: `@keyframes ${string}`]: Keyframes
    [k: `@property --${string}`]: PropertyRule
  }
  namespace FullComponent {
    interface div extends Css, Special<div> {
      [k: `${string},${string}`]: div | undefined
    }
  }

  /** components/story.tsx */
  interface Story {
    article: Story.article
    [k: `@keyframes ${string}`]: Keyframes
    [k: `@property --${string}`]: PropertyRule
  }
  namespace Story {
    interface article extends Css, Special<article> {
      [k: `${string},${string}`]: article | Boundary | article_header | article_main | article_footer | article_header_h1 | article_header_p | article_main_p | article_main_img | article_main_div | article_footer_a | undefined
      compact?: article
      urgent?: article
      Byline?: Boundary
      header?: article_header
      main?: article_main
      footer?: article_footer
      h1?: article_header_h1
      p?: article_header_p | article_main_p
      img?: article_main_img
      div?: article_main_div
      a?: article_footer_a
    }
    interface article_header extends Css, Special<article_header> {
      [k: `${string},${string}`]: article_header | article_header_h1 | article_header_p | undefined
      h1?: article_header_h1
      p?: article_header_p
    }
    interface article_header_h1 extends Css, Special<article_header_h1> {
      [k: `${string},${string}`]: article_header_h1 | undefined
    }
    interface article_header_p extends Css, Special<article_header_p> {
      [k: `${string},${string}`]: article_header_p | undefined
    }
    interface article_main extends Css, Special<article_main> {
      [k: `${string},${string}`]: article_main | article_main_img | article_main_p | article_main_div | undefined
      img?: article_main_img
      p?: article_main_p
      div?: article_main_div
    }
    interface article_main_img extends Css, Special<article_main_img> {
      [k: `${string},${string}`]: article_main_img | undefined
    }
    interface article_main_p extends Css, Special<article_main_p> {
      [k: `${string},${string}`]: article_main_p | undefined
    }
    interface article_main_div extends Css, Special<article_main_div> {
      [k: `${string},${string}`]: article_main_div | Boundary | undefined
      FullComponent?: Boundary
    }
    interface article_footer extends Css, Special<article_footer> {
      [k: `${string},${string}`]: article_footer | article_footer_a | undefined
      a?: article_footer_a
    }
    interface article_footer_a extends Css, Special<article_footer_a> {
      [k: `${string},${string}`]: article_footer_a | undefined
    }
  }
}
