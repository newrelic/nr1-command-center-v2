const query = require('../utils');

const ACCOUNT = 12345;
const TIME = 'SINCE 1 hour ago';
const CURSOR = 'abc123cursor';

describe('utils query builders', () => {
  test('issuesByPriority — no cursor includes account in query', () => {
    const result = query.issuesByPriority(ACCOUNT, null);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain(String(ACCOUNT));
  });

  test('issuesByPriority — with cursor injects cursor value', () => {
    const result = query.issuesByPriority(ACCOUNT, CURSOR);
    expect(result).toContain(CURSOR);
    expect(result).toContain(String(ACCOUNT));
  });

  test('openViolations — contains account id and time', () => {
    const result = query.openViolations(ACCOUNT, TIME);
    expect(typeof result).toBe('string');
    expect(result).toContain(String(ACCOUNT));
    expect(result).toContain(TIME);
  });

  test('openViolationData — contains account id and violation ids', () => {
    const vios = '1,2,3';
    const result = query.openViolationData(ACCOUNT, vios, TIME);
    expect(typeof result).toBe('string');
    expect(result).toContain(String(ACCOUNT));
    expect(result).toContain(vios);
    expect(result).toContain(TIME);
  });

  test('openIssues — no cursor includes account in query', () => {
    const result = query.openIssues(ACCOUNT, null);
    expect(typeof result).toBe('string');
    expect(result).toContain(String(ACCOUNT));
  });

  test('openIssues — with cursor injects cursor value', () => {
    const result = query.openIssues(ACCOUNT, CURSOR);
    expect(result).toContain(CURSOR);
    expect(result).toContain(String(ACCOUNT));
  });

  test('userName — contains userId', () => {
    const userId = 'user-789';
    const result = query.userName(userId);
    expect(typeof result).toBe('string');
    expect(result).toContain(userId);
  });

  test('entityStatusByIssue — contains guids', () => {
    const guids = 'guid1,guid2';
    const result = query.entityStatusByIssue(guids);
    expect(typeof result).toBe('string');
    expect(result).toContain(guids);
  });

  test('issueCount — contains account id and time', () => {
    const result = query.issueCount(ACCOUNT, TIME);
    expect(typeof result).toBe('string');
    expect(result).toContain(String(ACCOUNT));
    expect(result).toContain(TIME);
  });

  test('issueMinutes — contains account id and time', () => {
    const result = query.issueMinutes(ACCOUNT, TIME);
    expect(typeof result).toBe('string');
    expect(result).toContain(String(ACCOUNT));
    expect(result).toContain(TIME);
  });

  test('issueMTTR — contains account id and time', () => {
    const result = query.issueMTTR(ACCOUNT, TIME);
    expect(typeof result).toBe('string');
    expect(result).toContain(String(ACCOUNT));
    expect(result).toContain(TIME);
  });

  test('issueUnder5min — contains account id and time', () => {
    const result = query.issueUnder5min(ACCOUNT, TIME);
    expect(typeof result).toBe('string');
    expect(result).toContain(String(ACCOUNT));
    expect(result).toContain(TIME);
  });

  test('dashboards — contains account id and dashboard name', () => {
    const dash = 'Alert Quality Management';
    const result = query.dashboards(ACCOUNT, dash);
    expect(typeof result).toBe('string');
    expect(result).toContain(String(ACCOUNT));
    expect(result).toContain(dash);
  });
});
