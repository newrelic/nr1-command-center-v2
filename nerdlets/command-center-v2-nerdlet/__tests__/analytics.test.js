import { getTooltip, computeAggregate } from '../analytics';

describe('getTooltip', () => {
  test('returns a non-empty string for known keys', () => {
    const result = getTooltip('Issue Count');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('returns non-empty strings for all four known keys', () => {
    const keys = [
      'Issue Count',
      'Issue Minutes (accumulated)',
      'Avg Issue MTTR (minutes)',
      'Issues closed under 5min (%)',
    ];
    for (const key of keys) {
      expect(getTooltip(key).length).toBeGreaterThan(0);
    }
  });

  test('returns empty string for unknown key', () => {
    expect(getTooltip('Unknown Metric')).toBe('');
    expect(getTooltip('')).toBe('');
  });
});

describe('computeAggregate', () => {
  test('sums issue counts and minutes across accounts', () => {
    const data = [
      { issueCount: 10, issueMin: 100, issueMTTR: 5, issueUnder5: 20 },
      { issueCount: 5, issueMin: 50, issueMTTR: 3, issueUnder5: 40 },
    ];
    const result = computeAggregate(data);
    expect(result['Issue Count']).toBe(15);
    expect(result['Issue Minutes (accumulated)']).toBe(150);
  });

  test('averages MTTR across accounts', () => {
    const data = [
      { issueCount: 10, issueMin: 100, issueMTTR: 6, issueUnder5: 20 },
      { issueCount: 5, issueMin: 50, issueMTTR: 2, issueUnder5: 40 },
    ];
    const result = computeAggregate(data);
    expect(result['Avg Issue MTTR (minutes)']).toBe(4);
  });

  test('excludes null MTTR values from average', () => {
    const data = [
      { issueCount: 10, issueMin: 100, issueMTTR: null, issueUnder5: null },
    ];
    const result = computeAggregate(data);
    expect(result['Avg Issue MTTR (minutes)']).toBe(0);
    expect(result['Issues closed under 5min (%)']).toBe(0);
  });

  test('excludes accounts with issueCount === 0 from issue count and minutes sum', () => {
    const data = [
      { issueCount: 0, issueMin: 999, issueMTTR: 5, issueUnder5: 20 },
    ];
    const result = computeAggregate(data);
    expect(result['Issue Count']).toBe(0);
    expect(result['Issue Minutes (accumulated)']).toBe(0);
  });

  test('returns zeros for empty account array', () => {
    const result = computeAggregate([]);
    expect(result['Issue Count']).toBe(0);
    expect(result['Issue Minutes (accumulated)']).toBe(0);
    expect(result['Avg Issue MTTR (minutes)']).toBe(0);
    expect(result['Issues closed under 5min (%)']).toBe(0);
  });
});
