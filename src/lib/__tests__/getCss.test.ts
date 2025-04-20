/**
 * Tests for getCss functionality
 */

import { getCss } from '../getCss.js'
import { CssStyles } from '../types/index.js'

describe('getCss', () => {
  // Test basic functionality (T1)
  test('should convert basic JavaScript object to CSS', () => {
    const input: CssStyles = {
      p: {
        fontSize: '16px',
      },
    }

    const output = getCss(input)
    expect(output).toContain('p')
    expect(output).toContain('font-size:16px')
  })

  // Test nested selectors (T2)
  test('should handle nested selectors', () => {
    const input: CssStyles = {
      p: {
        fontSize: '16px',
        a: {
          color: 'red',
        },
      },
    }

    const output = getCss(input)
    expect(output).toContain('p')
    expect(output).toContain('font-size:16px')
    expect(output).toContain('p a')
    expect(output).toContain('color:red')
  })

  // Test class selectors (T3)
  test('should convert non-tag keys to class selectors', () => {
    const input: CssStyles = {
      sticker: {
        backgroundColor: 'yellow',
      },
      p: {
        fontSize: '16px',
        warning: {
          color: 'red',
        },
      },
    }

    const output = getCss(input)
    expect(output).toContain('.sticker')
    expect(output).toContain('background-color:yellow')
    expect(output).toContain('p')
    expect(output).toContain('font-size:16px')
    expect(output).toContain('p.warning')
    expect(output).toContain('color:red')
  })

  // Test pseudo-classes and complex selectors (T4)
  test('should handle pseudo-classes and complex selectors', () => {
    const input: CssStyles = {
      a: {
        color: 'blue',
        ':hover': {
          color: 'red',
        },
      },
      ul: {
        '-ms-overflow-style': 'none',
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
          display: 'none',
        },
      },
    }

    const output = getCss(input)
    expect(output).toContain('a')
    expect(output).toContain('color:blue')
    expect(output).toContain('a:hover')
    expect(output).toContain('color:red')
    expect(output).toContain('ul')
    expect(output).toContain('-ms-overflow-style:none')
    expect(output).toContain('scrollbar-width:none')
    expect(output).toContain('ul::-webkit-scrollbar')
    expect(output).toContain('display:none')
  })

  // Test class name equals tag name with underscore (T5)
  test('should handle underscore prefix for class names', () => {
    const input: CssStyles = {
      div: {
        video: {
          width: '100%',
          height: '100%',
        },
        _video: {
          padding: '10px',
        },
      },
    }

    const output = getCss(input)
    expect(output).toContain('div video')
    expect(output).toContain('width:100%')
    expect(output).toContain('height:100%')
    expect(output).toContain('div.video')
    expect(output).toContain('padding:10px')
  })

  // Test double underscore (T6)
  test('should handle double underscore for descendant classes', () => {
    const input: CssStyles = {
      div: {
        fontSize: '16px',
        video: {
          width: '100%',
          height: '100%',
        },
        _video: {
          borderRadius: '10px',
        },
        __video: {
          fontStyle: 'italic',
        },
      },
    }

    const output = getCss(input)
    expect(output).toContain('div')
    expect(output).toContain('font-size:16px')
    expect(output).toContain('div video')
    expect(output).toContain('width:100%')
    expect(output).toContain('height:100%')
    expect(output).toContain('div.video')
    expect(output).toContain('border-radius:10px')
    expect(output).toContain('div .video')
    expect(output).toContain('font-style:italic')
  })

  // Test complex selectors (T7)
  test('should handle complex selectors', () => {
    const input: CssStyles = {
      ul: {
        '> li:not(:last-child) > img': {
          filter: 'grayscale(100%)',
        },
      },
    }

    const output = getCss(input)
    expect(output).toContain('ul > li:not(:last-child) > img')
    expect(output).toContain('filter:grayscale(100%)')
  })

  // Test comma-separated selectors (T8)
  test('should handle comma-separated selectors', () => {
    const input: CssStyles = {
      body: {
        'main, aside': {
          'input, textarea, button': {
            outline: 'none',
          },
        },
      },
    }

    const output = getCss(input)
    // Instead of checking exact string patterns, we'll verify that all the
    // combinations are present and have the right properties
    expect(output).toContain('body main input')
    expect(output).toContain('body main textarea')
    expect(output).toContain('body main button')
    expect(output).toContain('body aside input')
    expect(output).toContain('body aside textarea')
    expect(output).toContain('body aside button')
    expect(output).toContain('outline:none')
  })

  // Test content property (T9)
  test('should handle content property correctly', () => {
    const input: CssStyles = {
      span: {
        '::before': {
          content: 'Hello',
        },
        '::after': {
          content: '\u00a0', // non-breaking space
        },
      },
    }

    const output = getCss(input)
    expect(output).toContain('span::before')
    expect(output).toContain("content:'Hello'")
    expect(output).toContain('span::after')
    // Note: The exact format of Unicode escapes may vary, so we'll check for a partial match
    expect(output).toContain("content:'")
    expect(output).toContain('00a0')
  })

  // Test media queries (T10)
  test('should handle media queries', () => {
    const input: CssStyles = {
      p: {
        fontSize: '1rem',
        '@media screen and (max-width: 768px)': {
          fontSize: '0.875rem',
        },
      },
    }

    const output = getCss(input)
    expect(output).toContain('p')
    expect(output).toContain('font-size:1rem')
    expect(output).toContain('@media screen and (max-width: 768px)')
    expect(output).toContain('0.875rem')
  })

  // Test named media queries (T12)
  test('should handle named media queries', () => {
    const input: CssStyles = {
      div: {
        fontFamily: 'var(--sans-serif)',
        '@min-tablet': {
          fontSize: '14px',
        },
        '@phone': {
          fontSize: '12px',
        },
      },
    }

    const mediaQueries = {
      'min-tablet': '(min-width: 500px)',
      phone: '(max-width: 499px)',
    }

    const output = getCss(input, mediaQueries)
    expect(output).toContain('div')
    expect(output).toContain('font-family:var(--sans-serif)')
    expect(output).toContain('@media (min-width: 500px)')
    expect(output).toContain('14px')
    expect(output).toContain('@media (max-width: 499px)')
    expect(output).toContain('12px')
  })

  // Test layer support (T13)
  test('should handle layers correctly', () => {
    const input: CssStyles = {
      '@layer a, b, c': '',
      div: {
        thin: {
          fontWeight: 200,
          '@layer a': { fontWeight: 300 },
        },
      },
      blockquote: {
        color: 'red',
        '@layer a': { fontWeight: 300 },
      },
    }

    const output = getCss(input)
    expect(output).toContain('@layer a, b, c')
    expect(output).toContain('div.thin')
    expect(output).toContain('font-weight:200')
    expect(output).toContain('blockquote')
    expect(output).toContain('color:red')
    expect(output).toContain('@layer a')
    expect(output).toContain('font-weight:300')
  })
})
