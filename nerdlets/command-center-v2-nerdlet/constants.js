import { Badge } from 'nr1';

export const BADGE_TYPES = {
  critical: Badge.TYPE.CRITICAL,
  high: Badge.TYPE.SEVERE, // for issues
  warning: Badge.TYPE.SEVERE, // for incidents
  unknown: Badge.TYPE.NORMAL,
};

export const STATUSES = {
  NOT_ALERTING: 'success',
  WARNING: 'warning',
  CRITICAL: 'critical',
  NOT_CONFIGURED: 'unknown',
};
