import { describe, it, expect } from 'vitest';
import { formatTimeAgo, formatDate, formatShortDate, formatFullDate } from './timeUtils';

describe('timeUtils', () => {
  describe('formatTimeAgo', () => {
    it('returns empty string for null/undefined', () => {
      expect(formatTimeAgo(null)).toBe('');
      expect(formatTimeAgo(undefined)).toBe('');
    });

    it('handles Firebase timestamp object', () => {
      const firebaseTimestamp = { toDate: () => new Date('2024-01-15T12:00:00Z') };
      const result = formatTimeAgo(firebaseTimestamp);
      expect(typeof result).toBe('string');
    });

    it('handles Date object', () => {
      const result = formatTimeAgo(new Date('2024-01-15T12:00:00Z'));
      expect(typeof result).toBe('string');
    });

    it('handles ISO string', () => {
      const result = formatTimeAgo('2024-01-15T12:00:00Z');
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDate', () => {
    it('returns empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    it('formats date with Firebase timestamp', () => {
      const firebaseTimestamp = { toDate: () => new Date('2024-01-15T12:00:00Z') };
      const result = formatDate(firebaseTimestamp);
      expect(typeof result).toBe('string');
    });

    it('formats date with Date object', () => {
      const result = formatDate(new Date('2024-01-15T12:00:00Z'));
      expect(typeof result).toBe('string');
    });

    it('formats date with ISO string', () => {
      const result = formatDate('2024-01-15T12:00:00Z');
      expect(typeof result).toBe('string');
    });
  });

  describe('formatShortDate', () => {
    it('returns empty string for null/undefined', () => {
      expect(formatShortDate(null)).toBe('');
      expect(formatShortDate(undefined)).toBe('');
    });

    it('formats short date with Firebase timestamp', () => {
      const firebaseTimestamp = { toDate: () => new Date('2024-01-15T12:00:00Z') };
      const result = formatShortDate(firebaseTimestamp);
      expect(typeof result).toBe('string');
    });

    it('formats short date with Date object', () => {
      const result = formatShortDate(new Date('2024-01-15T12:00:00Z'));
      expect(typeof result).toBe('string');
    });
  });

  describe('formatFullDate', () => {
    it('returns empty string for null/undefined', () => {
      expect(formatFullDate(null)).toBe('');
      expect(formatFullDate(undefined)).toBe('');
    });

    it('formats full date with Firebase timestamp', () => {
      const firebaseTimestamp = { toDate: () => new Date('2024-01-15T12:00:00Z') };
      const result = formatFullDate(firebaseTimestamp);
      expect(typeof result).toBe('string');
    });

    it('formats full date with Date object', () => {
      const result = formatFullDate(new Date('2024-01-15T12:00:00Z'));
      expect(typeof result).toBe('string');
    });

    it('formats full date with ISO string', () => {
      const result = formatFullDate('2024-01-15T12:00:00Z');
      expect(typeof result).toBe('string');
    });
  });
});
