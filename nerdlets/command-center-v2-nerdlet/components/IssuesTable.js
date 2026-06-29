import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Tooltip } from 'nr1';
import { Table } from 'semantic-ui-react';
import moment from 'moment';

import { BADGE_TYPES } from '../constants';

const HEADERS = [
  'ID',
  'Account',
  'Title',
  '# Alert Events',
  '# Entities',
  'Priority',
  'Opened At',
  'Duration',
  'Muted',
  'Ack',
  'Close',
  'Links',
];

const WIDTH_BY_HEADER = {
  ID: 2,
  Account: 2,
  Title: 6,
  '# Alert Events': 1,
  '# Entities': 1,
  Priority: 1,
  Links: 4,
};

function getWidth(header) {
  return WIDTH_BY_HEADER[header] ?? 2;
}

function getInitials(user) {
  const parts = user.match(/\b\w/g) || [];
  return ((parts.shift() || '') + (parts.pop() || '')).toUpperCase();
}

function IssuesTable({
  rows,
  column,
  direction,
  baseUrl,
  onSort,
  onOpenAck,
  onOpenClose,
  onOpenLink,
  onOpenEntities,
}) {
  return (
    <div
      style={{
        overflowY: 'scroll',
        display: rows.length === 0 ? 'none' : 'flex',
      }}
    >
      <Table compact selectable sortable celled>
        <Table.Header className="sorted ascending">
          <Table.Row>
            {HEADERS.map((header) => (
              <Table.HeaderCell
                key={header}
                sorted={column === header ? direction : undefined}
                onClick={() => onSort(header)}
                width={getWidth(header)}
              >
                {header}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => {
            const activatedSec = row.activatedAt / 1000;
            return (
              <Table.Row key={row.issueId}>
                <Table.Cell>
                  <a
                    href={`${baseUrl}/accounts/${row.accountId.toString()}/issues/${row.issueId}?notifier=&action=`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {row.issueId}
                  </a>
                </Table.Cell>
                <Table.Cell>{row.accountName}</Table.Cell>
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>{row.incidentCount}</Table.Cell>
                <Table.Cell>
                  {typeof row.relatedEntityId === 'undefined' ||
                  row.relatedEntityId.length === 0 ? (
                    <span>0</span>
                  ) : (
                    <a
                      style={{ cursor: 'pointer' }}
                      onClick={() => onOpenEntities(row.relatedEntityId)}
                    >
                      {row.relatedEntityId.length}
                    </a>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    type={
                      BADGE_TYPES[row.priority?.toLowerCase()] ??
                      BADGE_TYPES.unknown
                    }
                  >
                    {row.priority
                      ? row.priority.charAt(0).toUpperCase() +
                        row.priority.slice(1).toLowerCase()
                      : 'Unknown'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {moment.unix(activatedSec).format('MM/DD/YY, h:mm a')}
                </Table.Cell>
                <Table.Cell>
                  {row.duration.get('days') > 0
                    ? `${row.duration.get('days')}d `
                    : ''}
                  {row.duration.get('hours') > 0
                    ? `${row.duration.get('hours')}hr `
                    : ''}
                  {row.duration.get('minutes') > 0
                    ? `${row.duration.get('minutes')}m `
                    : ''}
                  {row.duration.get('seconds') > 0
                    ? `${row.duration.get('seconds')}s `
                    : ''}
                </Table.Cell>
                <Table.Cell>
                  {row.mutingState === 'NOT_MUTED' ? 'false' : 'true'}
                </Table.Cell>
                <Table.Cell>
                  {row.ackUser == null ? (
                    <Button
                      onClick={() => onOpenAck(row)}
                      type={Button.TYPE.PRIMARY}
                      iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__FOLLOW}
                    />
                  ) : (
                    <Tooltip
                      text={row.ackUser}
                      placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
                    >
                      <Button
                        style={{ backgroundColor: 'black' }}
                        type={Button.TYPE.PRIMARY}
                      >
                        <strong>{getInitials(row.ackUser)}</strong>
                      </Button>
                    </Tooltip>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Button
                    onClick={() => onOpenClose(row)}
                    type={Button.TYPE.PRIMARY}
                    iconType={
                      Button.ICON_TYPE.INTERFACE__OPERATIONS__ALERT__A_REMOVE
                    }
                  />
                </Table.Cell>
                <Table.Cell>
                  <div style={{ display: 'inline-flex' }}>
                    <Button
                      onClick={() => onOpenLink(row)}
                      type={Button.TYPE.PRIMARY}
                      iconType={
                        Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_EDIT
                      }
                    />
                    {row.link && row.display && (
                      <a
                        className="notesLink"
                        href={row.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {row.display}
                      </a>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}

IssuesTable.propTypes = {
  rows: PropTypes.array.isRequired,
  column: PropTypes.string,
  direction: PropTypes.string,
  baseUrl: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
  onOpenAck: PropTypes.func.isRequired,
  onOpenClose: PropTypes.func.isRequired,
  onOpenLink: PropTypes.func.isRequired,
  onOpenEntities: PropTypes.func.isRequired,
};

export default memo(IssuesTable);
