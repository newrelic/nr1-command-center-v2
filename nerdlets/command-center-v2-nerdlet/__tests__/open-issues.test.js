import {
  applyTagsToIssue,
  validateLinkInput,
  buildBaseUrl,
} from '../open-issues';

describe('applyTagsToIssue', () => {
  test('converts numeric tag keys to numbers', () => {
    const issue = {
      tags: [
        { key: 'activatedAt', values: ['1700000000000'] },
        { key: 'accountId', values: ['12345'] },
        { key: 'incidentCount', values: ['3'] },
      ],
    };
    applyTagsToIssue(issue);
    expect(issue.activatedAt).toBe(1700000000000);
    expect(issue.accountId).toBe(12345);
    expect(issue.incidentCount).toBe(3);
  });

  test('preserves array tag keys as arrays', () => {
    const issue = {
      tags: [
        { key: 'relatedEntityName', values: ['entity-a', 'entity-b'] },
        { key: 'relatedEntityId', values: ['id-1', 'id-2'] },
      ],
    };
    applyTagsToIssue(issue);
    expect(issue.relatedEntityName).toEqual(['entity-a', 'entity-b']);
    expect(issue.relatedEntityId).toEqual(['id-1', 'id-2']);
  });

  test('assigns first value for string tag keys', () => {
    const issue = {
      tags: [
        { key: 'priority', values: ['CRITICAL'] },
        { key: 'mutingState', values: ['NOT_MUTED'] },
      ],
    };
    applyTagsToIssue(issue);
    expect(issue.priority).toBe('CRITICAL');
    expect(issue.mutingState).toBe('NOT_MUTED');
  });

  test('handles empty tags array without error', () => {
    const issue = { tags: [] };
    expect(() => applyTagsToIssue(issue)).not.toThrow();
  });
});

// validateLinkInput is duplicated from open-violations.js
describe('validateLinkInput', () => {
  test('returns "empty" when displayText is empty', () => {
    expect(validateLinkInput('', 'https://example.com')).toBe('empty');
  });

  test('returns "empty" when linkText is empty', () => {
    expect(validateLinkInput('My Link', '')).toBe('empty');
  });

  test('returns "scheme" for non-http/https URL', () => {
    expect(validateLinkInput('My Link', 'ftp://example.com')).toBe('scheme');
  });

  test('returns null for valid https URL', () => {
    expect(validateLinkInput('My Link', 'https://example.com')).toBeNull();
  });
});

describe('buildBaseUrl', () => {
  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: 'about:blank' },
      configurable: true,
    });
  });

  test('returns EU endpoint when URL contains "one.eu"', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://one.eu.newrelic.com/nerdpacks' },
      configurable: true,
    });
    expect(buildBaseUrl()).toBe('https://radar-api.service.eu.newrelic.com');
  });

  test('returns US endpoint for non-EU URL', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://one.newrelic.com/nerdpacks' },
      configurable: true,
    });
    expect(buildBaseUrl()).toBe('https://radar-api.service.newrelic.com');
  });
});
