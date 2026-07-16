import { getCardColor, getIcon, countPriorities } from '../splash';

describe('getCardColor', () => {
  test('returns "red" when critical count is 1 or more', () => {
    expect(getCardColor({ critical: 1, high: 0, anomalyCount: 0 })).toBe(
      'red'
    );
    expect(getCardColor({ critical: 3, high: 2, anomalyCount: 0 })).toBe(
      'red'
    );
  });

  test('returns "orange" when high > 0 and critical === 0', () => {
    expect(getCardColor({ critical: 0, high: 1, anomalyCount: 0 })).toBe(
      'orange'
    );
  });

  test('returns "orange" when anomalyCount > 0 and critical === 0', () => {
    expect(getCardColor({ critical: 0, high: 0, anomalyCount: 2 })).toBe(
      'orange'
    );
  });

  test('returns "green" when all counts are zero', () => {
    expect(getCardColor({ critical: 0, high: 0, anomalyCount: 0 })).toBe(
      'green'
    );
  });
});

describe('getIcon', () => {
  test('returns "ban" when critical count is 1 or more', () => {
    expect(getIcon({ critical: 1, high: 0, anomalyCount: 0 })).toBe('ban');
  });

  test('returns "exclamation circle" when high > 0 and critical === 0', () => {
    expect(getIcon({ critical: 0, high: 1, anomalyCount: 0 })).toBe(
      'exclamation circle'
    );
  });

  test('returns "exclamation circle" when anomalyCount > 0 and critical === 0', () => {
    expect(getIcon({ critical: 0, high: 0, anomalyCount: 1 })).toBe(
      'exclamation circle'
    );
  });

  test('returns "check circle" when all counts are zero', () => {
    expect(getIcon({ critical: 0, high: 0, anomalyCount: 0 })).toBe(
      'check circle'
    );
  });
});

describe('countPriorities', () => {
  const makeIssue = (priority, mutingState = 'NOT_MUTED') => ({
    tags: [
      { key: 'priority', values: [priority] },
      { key: 'mutingState', values: [mutingState] },
    ],
  });

  test('counts critical and high issues correctly', () => {
    const issues = [
      makeIssue('CRITICAL'),
      makeIssue('CRITICAL'),
      makeIssue('HIGH'),
    ];
    expect(countPriorities(issues)).toEqual({ critical: 2, high: 1, muted: 0 });
  });

  test('counts fully muted issues', () => {
    const issues = [
      makeIssue('CRITICAL', 'FULLY_MUTED'),
      makeIssue('HIGH', 'NOT_MUTED'),
    ];
    expect(countPriorities(issues)).toEqual({ critical: 1, high: 1, muted: 1 });
  });

  test('returns zeros for empty array', () => {
    expect(countPriorities([])).toEqual({ critical: 0, high: 0, muted: 0 });
  });

  test('ignores issues without matching priority tags', () => {
    const issue = { tags: [{ key: 'someOtherTag', values: ['val'] }] };
    expect(countPriorities([issue])).toEqual({ critical: 0, high: 0, muted: 0 });
  });
});
