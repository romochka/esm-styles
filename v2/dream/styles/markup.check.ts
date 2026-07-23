// Компайл-тайм проверки слоя 2: структура стилей против скелетов Markup.
// Файл не исполняется. Каждый @ts-expect-error обязан давать ошибку.
// Сценарии повторяют макеты из v2/plan/styles/story.*.styles.mjs.

// Сокращённый путь: в разметке ul > li > a, уровень li можно опустить.
export const shorthandPath = {
  nav: { ul: { a: { color: 'red' } } },
} satisfies StyleOf<Markup.Nav>

// Неоднозначное сокращение: p есть и в header, и в main — тип это допускает
// (union), уточнить путь попросит линтер (жёлтое, слой 3).
export const ambiguousShorthand = {
  article: { p: { fontStyle: 'italic' } },
} satisfies StyleOf<Markup.Story>

// Вариант компонента и служебные ключи.
export const variantAndSpecials = {
  article: {
    compact: { flexDirection: 'row' },
    ':hover': { header: { h1: { color: 'red' } } },
    '@mobile': { gap: '0.5rem' },
  },
} satisfies StyleOf<Markup.Story>

// {children} — непрозрачный слот: валидацию владельца НЕ ослабляет.
// main приносят страницы, Layout его не стилизует.
export const slotStaysStrict = {
  body: {
    // @ts-expect-error main не принадлежит разметке Layout
    main: { padding: '1rem' },
  },
} satisfies StyleOf<Markup.Layout>

// Зона контента (data-content): ключи-селекторы свободны — разметка
// внутри prose неизвестна (markdown)…
export const contentZone = {
  main: {
    section: {
      prose: {
        h2: { fontSize: '1.3rem' },
        table: { borderCollapse: 'collapse' },
      },
    },
  },
} satisfies StyleOf<Markup.StoryPage>

// …но значения свойств проверяются даже внутри зоны контента.
export const contentZoneValues = {
  main: {
    section: {
      prose: {
        // @ts-expect-error boolean не бывает CSS-значением и в зоне контента
        h2: { fontSize: true },
      },
    },
  },
} satisfies StyleOf<Markup.StoryPage>

// Прозрачный субкомпонент: <SubComponent/> (без своего класса на корне)
// вклеен в скелет Story — его div стилизуется как часть Story.
export const transparentSub = {
  article: { main: { div: { color: 'red' } } },
} satisfies StyleOf<Markup.Story>

// @ts-expect-error у прозрачного субкомпонента нет собственного скелета
export type NoSubComponentMarkup = Markup.SubComponent

// Дети, переданные прозрачной обёртке, вклеиваются в её {children}-слот:
// <SubWrapper><FullComponent/></SubWrapper> → main > div > FullComponent.
// FullComponent несёт свой класс → это граница, позиционировать можно…
export const slottedChildren = {
  article: { main: { div: { FullComponent: { marginTop: '1rem' } } } },
} satisfies StyleOf<Markup.Story>

// …а внутрь нельзя.
export const slottedBoundary = {
  article: {
    main: {
      div: {
        FullComponent: {
          // @ts-expect-error внутрь FullComponent из Story лезть нельзя
          div: { color: 'red' },
        },
      },
    },
  },
} satisfies StyleOf<Markup.Story>

// --- красное (макет story.error.styles.mjs) --------------------------------

export const wrongRootTag = {
  // @ts-expect-error корневой элемент Story — article, а не div
  div: { display: 'flex' },
} satisfies StyleOf<Markup.Story>

// --- красное (макет story.warning.styles.mjs; по спеке
// «несуществующий путь — ошибка», в разметке Story нет aside) ---------------

export const unknownElement = {
  article: {
    // @ts-expect-error в разметке Story нет aside
    aside: { width: '25%' },
  },
} satisfies StyleOf<Markup.Story>

// --- красное: граница компонента ------------------------------------------

export const boundaryReach = {
  article: {
    Byline: {
      marginTop: '1rem',
      // @ts-expect-error внутрь Byline из Story лезть нельзя
      img: { width: '1rem' },
    },
  },
} satisfies StyleOf<Markup.Story>

// --- красное: опечатка в имени свойства теперь ловится ---------------------

export const propertyTypo = {
  article: {
    // @ts-expect-error нет такого свойства (в слое 1 прошло бы как селектор)
    colr: 'red',
  },
} satisfies StyleOf<Markup.Story>
