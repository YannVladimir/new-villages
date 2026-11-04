import { describe, expect, it } from 'vitest';
import { formatEventDate, formatEventTime, formatRelativeTime } from './format';

describe('formatEventDate', () => {
  it('formats an ISO date as "Mon D, YYYY"', () => {
    expect(formatEventDate('2026-03-15T18:30:00Z')).toBe('Mar 15, 2026');
  });
});

describe('formatEventTime', () => {
  it('formats an ISO date as a localized time', () => {
    // Just assert it produces a non-empty, parseable time string rather than
    // pinning an exact value (depends on the runner's timezone).
    const result = formatEventTime('2026-03-15T18:30:00Z');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for timestamps less than a minute old', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('pluralizes minutes correctly', () => {
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 min ago');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 mins ago');
  });

  it('pluralizes hours correctly', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
  });

  it('pluralizes days correctly and falls back to a date beyond a week', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');

    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(twoWeeksAgo)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});
