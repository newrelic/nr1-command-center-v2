import { buildExportable, validateLinkInput } from '../open-violations';

const SAMPLE_ROW = {
  accountName: 'Test Account',
  policyName: 'High CPU Policy',
  conditionName: 'CPU > 90%',
  targetName: 'web-server-01',
  title: 'CPU threshold exceeded',
  priority: 'HIGH',
  openTime: 1700000000000,
  muted: false,
  mutingRuleId: null,
  mutingRuleName: null,
  link: 'https://example.com/incident/1',
};

describe('buildExportable', () => {
  test('maps all fields from a row to export format', () => {
    const [result] = buildExportable([SAMPLE_ROW]);
    expect(result.Account).toBe('Test Account');
    expect(result['Policy Name']).toBe('High CPU Policy');
    expect(result['Condition Name']).toBe('CPU > 90%');
    expect(result.Entity).toBe('web-server-01');
    expect(result.Description).toBe('CPU threshold exceeded');
    expect(result.Priority).toBe('HIGH');
    expect(result.Muted).toBe('false');
    expect(result.MutingRuleId).toBeNull();
    expect(result.Link).toBe('https://example.com/incident/1');
  });

  test('formats openTime as a date string', () => {
    const [result] = buildExportable([SAMPLE_ROW]);
    expect(typeof result['Opened At']).toBe('string');
    expect(result['Opened At'].length).toBeGreaterThan(0);
  });

  test('returns empty array for empty input', () => {
    expect(buildExportable([])).toEqual([]);
  });
});

describe('validateLinkInput', () => {
  test('returns "empty" when displayText is empty', () => {
    expect(validateLinkInput('', 'https://example.com')).toBe('empty');
  });

  test('returns "empty" when linkText is empty', () => {
    expect(validateLinkInput('My Link', '')).toBe('empty');
  });

  test('returns "empty" when both are null', () => {
    expect(validateLinkInput(null, null)).toBe('empty');
  });

  test('returns "scheme" for non-http/https URL', () => {
    expect(validateLinkInput('My Link', 'ftp://example.com')).toBe('scheme');
  });

  test('returns "scheme" for an invalid URL string', () => {
    expect(validateLinkInput('My Link', 'not-a-url')).toBe('scheme');
  });

  test('returns null for valid https URL', () => {
    expect(validateLinkInput('My Link', 'https://example.com')).toBeNull();
  });

  test('returns null for valid http URL', () => {
    expect(validateLinkInput('My Link', 'http://example.com')).toBeNull();
  });
});
