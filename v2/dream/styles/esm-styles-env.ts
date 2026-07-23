// Сгенерировано esm-styles v2 (v2/src/gen.ts) — руками не редактировать.
// Перегенерация: npm run gen:v2
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

  /** app/archive/page.tsx */
  interface ArchivePage { main: ArchivePage.main }
  namespace ArchivePage {
    interface main extends Css, Special<main> {
      h2?: main_h2
      section?: main_section
      h3?: main_section_h3
      ul?: main_section_ul
      li?: main_section_ul_li
      a?: main_section_ul_li_a
      time?: main_section_ul_li_time
    }
    interface main_h2 extends Css, Special<main_h2> {}
    interface main_section extends Css, Special<main_section> {
      h3?: main_section_h3
      ul?: main_section_ul
      li?: main_section_ul_li
      a?: main_section_ul_li_a
      time?: main_section_ul_li_time
    }
    interface main_section_h3 extends Css, Special<main_section_h3> {}
    interface main_section_ul extends Css, Special<main_section_ul> {
      li?: main_section_ul_li
      a?: main_section_ul_li_a
      time?: main_section_ul_li_time
    }
    interface main_section_ul_li extends Css, Special<main_section_ul_li> {
      a?: main_section_ul_li_a
      time?: main_section_ul_li_time
    }
    interface main_section_ul_li_a extends Css, Special<main_section_ul_li_a> {}
    interface main_section_ul_li_time extends Css, Special<main_section_ul_li_time> {}
  }

  /** app/layout.tsx */
  interface Layout { body: Layout.body }
  namespace Layout {
    interface body extends Css, Special<body> {
      header?: body_header
      footer?: body_footer
      a?: body_header_a
      small?: body_footer_small
    }
    interface body_header extends Css, Special<body_header> {
      Nav?: Boundary
      a?: body_header_a
    }
    interface body_header_a extends Css, Special<body_header_a> {
      logo?: body_header_a
    }
    interface body_footer extends Css, Special<body_footer> {
      small?: body_footer_small
    }
    interface body_footer_small extends Css, Special<body_footer_small> {}
  }

  /** app/page.tsx */
  interface HomePage { main: HomePage.main }
  namespace HomePage {
    interface main extends Css, Special<main> {
      h2?: main_h2
      section?: main_section
    }
    interface main_h2 extends Css, Special<main_h2> {}
    interface main_section extends Css, Special<main_section> {
      feed?: main_section
      Story?: Boundary
    }
  }

  /** app/story/[slug]/page.tsx */
  interface StoryPage { main: StoryPage.main }
  namespace StoryPage {
    interface main extends Css, Special<main> {
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
      related?: main_nav
      Story?: Boundary
      h3?: main_nav_h3
    }
    interface main_nav_h3 extends Css, Special<main_nav_h3> {}
  }

  /** components/byline.tsx */
  interface Byline { address: Byline.address }
  namespace Byline {
    interface address extends Css, Special<address> {
      img?: address_img
      b?: address_b
      time?: address_time
    }
    interface address_img extends Css, Special<address_img> {}
    interface address_b extends Css, Special<address_b> {}
    interface address_time extends Css, Special<address_time> {}
  }

  /** components/gallery.tsx */
  interface Gallery { figure: Gallery.figure }
  namespace Gallery {
    interface figure extends Css, Special<figure> {
      img?: figure_img
      figcaption?: figure_figcaption
    }
    interface figure_img extends Css, Special<figure_img> {}
    interface figure_figcaption extends Css, Special<figure_figcaption> {}
  }

  /** components/nav.tsx */
  interface Nav { nav: Nav.nav }
  namespace Nav {
    interface nav extends Css, Special<nav> {
      open?: nav
      button?: nav_button
      ul?: nav_ul
      li?: nav_ul_li
      a?: nav_ul_li_a
    }
    interface nav_button extends Css, Special<nav_button> {}
    interface nav_ul extends Css, Special<nav_ul> {
      li?: nav_ul_li
      a?: nav_ul_li_a
    }
    interface nav_ul_li extends Css, Special<nav_ul_li> {
      a?: nav_ul_li_a
    }
    interface nav_ul_li_a extends Css, Special<nav_ul_li_a> {
      active?: nav_ul_li_a
    }
  }

  /** components/story.tsx */
  interface FullComponent { div: FullComponent.div }
  namespace FullComponent {
    interface div extends Css, Special<div> {}
  }

  /** components/story.tsx */
  interface Story { article: Story.article }
  namespace Story {
    interface article extends Css, Special<article> {
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
      h1?: article_header_h1
      p?: article_header_p
    }
    interface article_header_h1 extends Css, Special<article_header_h1> {}
    interface article_header_p extends Css, Special<article_header_p> {}
    interface article_main extends Css, Special<article_main> {
      img?: article_main_img
      p?: article_main_p
      div?: article_main_div
    }
    interface article_main_img extends Css, Special<article_main_img> {}
    interface article_main_p extends Css, Special<article_main_p> {}
    interface article_main_div extends Css, Special<article_main_div> {
      FullComponent?: Boundary
    }
    interface article_footer extends Css, Special<article_footer> {
      a?: article_footer_a
    }
    interface article_footer_a extends Css, Special<article_footer_a> {}
  }
}
