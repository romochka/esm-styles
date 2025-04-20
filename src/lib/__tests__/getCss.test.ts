import { getCss } from '../index.js'

describe('getCss', () => {
  it('converts camelCase properties and simple selectors', () => {
    expect(
      getCss({
        p: { fontSize: '16px', color: 'red' },
      })
    ).toContain('p {')
    expect(
      getCss({
        p: { fontSize: '16px', color: 'red' },
      })
    ).toContain('font-size: 16px;')
    expect(
      getCss({
        p: { fontSize: '16px', color: 'red' },
      })
    ).toContain('color: red;')
  })

  it('handles class and descendant class selectors', () => {
    expect(
      getCss({
        _foo: { color: 'blue' },
        div: { __bar: { color: 'green' } },
      })
    ).toContain('.foo {')
    expect(
      getCss({
        div: { __bar: { color: 'green' } },
      })
    ).toContain('div .bar {')
  })

  it('handles comma-separated selectors', () => {
    expect(
      getCss({
        'h1, h2': { color: 'purple' },
      })
    ).toContain('h1 {')
    expect(
      getCss({
        'h1, h2': { color: 'purple' },
      })
    ).toContain('h2 {')
  })

  it('handles pseudo-classes, ids, and attributes', () => {
    expect(
      getCss({
        a: { ':hover': { color: 'red' } },
        input: { '#id1': { color: 'blue' } },
        button: { '[type=submit]': { color: 'green' } },
      })
    ).toContain('a:hover {')
    expect(
      getCss({
        input: { '#id1': { color: 'blue' } },
      })
    ).toContain('input#id1 {')
    expect(
      getCss({
        button: { '[type=submit]': { color: 'green' } },
      })
    ).toContain('button[type=submit] {')
  })

  it('handles content property with emoji/unicode', () => {
    expect(
      getCss({
        span: { '::before': { content: '👀' } },
      })
    ).toMatch(/content: '\\00[0-9a-f]{4}\\00[0-9a-f]{4}';/i)
  })

  it('handles @media queries', () => {
    const css = getCss({
      p: {
        fontSize: '1rem',
        '@media screen and (max-width: 768px)': {
          fontSize: '14px',
        },
      },
    })
    expect(css).toContain('@media screen and (max-width: 768px)')
    expect(css).toContain('font-size: 14px;')
  })

  it('handles @layer blocks', () => {
    const css = getCss({
      div: {
        color: 'red',
        '@layer foo': { color: 'blue' },
      },
    })
    expect(css).toContain('@layer foo')
    expect(css).toContain('color: blue;')
  })
})
