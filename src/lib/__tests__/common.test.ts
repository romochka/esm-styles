/**
 * Tests for common utility functions
 */

import {
  getObjectType,
  isEndValue,
  indent,
  jsKeyToCssKey,
} from '../utils/common.js'

describe('Common utilities', () => {
  describe('getObjectType', () => {
    test('should correctly identify object types', () => {
      expect(getObjectType({})).toBe('object')
      expect(getObjectType([])).toBe('array')
      expect(getObjectType('string')).toBe('string')
      expect(getObjectType(123)).toBe('number')
      expect(getObjectType(true)).toBe('boolean')
      expect(getObjectType(null)).toBe('null')
      expect(getObjectType(undefined)).toBe('undefined')
      expect(getObjectType(new Date())).toBe('date')
    })
  })

  describe('isEndValue', () => {
    test('should identify end values', () => {
      expect(isEndValue('string')).toBe(true)
      expect(isEndValue(123)).toBe(true)
      expect(isEndValue(true)).toBe(true)
      expect(isEndValue(null)).toBe(true)
      expect(isEndValue({})).toBe(false)
      expect(isEndValue([])).toBe(false)
      expect(isEndValue(undefined)).toBe(false)
    })
  })

  describe('indent', () => {
    test('should indent a string with specified spaces', () => {
      const input = 'line1\nline2\nline3'
      const expected = '  line1\n  line2\n  line3'
      expect(indent(input, 2)).toBe(expected)
    })

    test('should use default 2 spaces if not specified', () => {
      const input = 'line1\nline2'
      const expected = '  line1\n  line2'
      expect(indent(input)).toBe(expected)
    })
  })

  describe('jsKeyToCssKey', () => {
    test('should convert camelCase to kebab-case', () => {
      expect(jsKeyToCssKey('fontSize')).toBe('font-size')
      expect(jsKeyToCssKey('borderTopWidth')).toBe('border-top-width')
      expect(jsKeyToCssKey('backgroundColor')).toBe('background-color')
    })

    test('should preserve vendor prefixes', () => {
      expect(jsKeyToCssKey('-webkit-boxShadow')).toBe('-webkit-box-shadow')
      expect(jsKeyToCssKey('-moz-borderRadius')).toBe('-moz-border-radius')
      expect(jsKeyToCssKey('-ms-overflow-style')).toBe('-ms-overflow-style')
    })

    test('should handle already kebab-case keys', () => {
      expect(jsKeyToCssKey('color')).toBe('color')
      expect(jsKeyToCssKey('border')).toBe('border')
    })
  })
})
