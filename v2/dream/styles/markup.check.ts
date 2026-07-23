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

// Свободная зона: body в Layout содержит {children} — валидация выключена.
export const freeZone = {
  body: { anythingGoesHere: { color: 'red' } },
} satisfies StyleOf<Markup.Layout>

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
