/**
 * Tests for selector utility functions
 */

import { joinSelectors, cartesianSelectors } from '../utils/selectors.js'

describe('Selector utilities', () => {
  describe('joinSelectors', () => {
    test('should join simple selectors', () => {
      expect(joinSelectors(['div', 'p'])).toBe('div p')
    })

    test('should handle class selectors', () => {
      // Non-HTML tag keys are not automatically converted to class selectors
      // unless they have an underscore prefix
      expect(joinSelectors(['div', 'header'])).toBe('div header')
    })

    test('should handle underscore prefix', () => {
      expect(joinSelectors(['div', '_video'])).toBe('div.video')
    })

    test('should handle double underscore prefix', () => {
      expect(joinSelectors(['div', '__video'])).toBe('div .video')
    })

    test('should handle pseudo-classes', () => {
      expect(joinSelectors(['a', ':hover'])).toBe('a:hover')
    })

    test('should handle attribute selectors', () => {
      expect(joinSelectors(['input', '[type=text]'])).toBe('input[type=text]')
    })

    test('should handle combinators', () => {
      expect(joinSelectors(['div', '>', 'p'])).toBe('div > p')
    })

    test('should handle single string input', () => {
      expect(joinSelectors('div')).toBe('div')
    })
  })

  describe('cartesianSelectors', () => {
    test('should create combinations of selectors', () => {
      const result = cartesianSelectors([
        ['div', 'span'],
        ['p', 'a'],
      ])

      expect(result).toContain('div p')
      expect(result).toContain('div a')
      expect(result).toContain('span p')
      expect(result).toContain('span a')
    })

    test('should handle empty arrays', () => {
      expect(cartesianSelectors([])).toEqual([])
    })

    test('should handle single array', () => {
      expect(cartesianSelectors([['div', 'span']])).toEqual(['div', 'span'])
    })
  })
})
