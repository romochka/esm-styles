/**
 * Tests for content utility functions
 */

import { formatContentValue } from '../utils/content.js'

describe('Content utilities', () => {
  describe('formatContentValue', () => {
    test('should handle null values', () => {
      expect(formatContentValue(null)).toBe('none')
    })

    test('should wrap string values in quotes', () => {
      expect(formatContentValue('Hello')).toBe("'Hello'")
    })

    test('should convert numbers to strings', () => {
      expect(formatContentValue(123)).toBe("'123'")
    })

    test('should convert booleans to strings', () => {
      expect(formatContentValue(true)).toBe("'true'")
      expect(formatContentValue(false)).toBe("'false'")
    })

    test('should handle already quoted strings', () => {
      expect(formatContentValue("'Hello'")).toBe("'Hello'")
      expect(formatContentValue('"World"')).toBe('"World"')
    })

    test('should handle special characters', () => {
      const result = formatContentValue('\u00a0') // non-breaking space
      expect(result.includes('\\0000a0')).toBe(true)
    })

    test('should handle emoji characters', () => {
      const result = formatContentValue('👍')
      expect(result.startsWith("'\\")).toBe(true)
    })
  })
})
