import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Tooltip } from 'nr1';
import { Table } from 'semantic-ui-react';
import dayjs from 'dayjs';

import { BADGE_TYPES } from '../constants';

const WIDTHS_MUTED = {
  ID: '4%',
  Account: '7%',
  'Policy Name': '8%',
  'Condition Name': '8%',
  Entity: '7%',
  Title: '12%',
  Description: '15%',
  Priority: '5%',
  'Opened At': '8%',
  Duration: '6%',
  Muted: '2%',
  'Muting Rule': '7%',
  Close: '4%',
  Links: '9%',
};

const WIDTHS_DEFAULT = {
  ID: '4%',
  Account: '8%',
  'Policy Name': '9%',
  'Condition Name': '9%',
  Entity: '8%',
  Title: '15%',
  Description: '13%',
  Priority: '5%',
  'Opened At': '8%',
  Duration: '7%',
  Muted: '3%',
  Close: '4%',
  Links: '7%',
};

function getWidth(header, hasMuted) {
  const widths = hasMuted ? WIDTHS_MUTED : WIDTHS_DEFAULT;
  return widths[header] || 'auto';
}

function HeaderCell({ header, column, direction, hasMuted, onSort }) {
  const toolTipText =
    header === 'Description' ? 'Custom Violation Description' : null;
  const cell = (
    <Table.HeaderCell
      sorted={column === header ? direction : undefined}
      onClick={() => onSort(header)}
      width={getWidth(header, hasMuted)}
    >
      {header}
    </Table.HeaderCell>
  );
  return toolTipText ? <Tooltip text={toolTipText}>{cell}</Tooltip> : cell;
}

HeaderCell.propTypes = {
  header: PropTypes.string.isRequired,
  column: PropTypes.string,
  direction: PropTypes.string,
  hasMuted: PropTypes.bool.isRequired,
  onSort: PropTypes.func.isRequired,
};

function IncidentsTable({
  rows,
  column,
  direction,
  hasMuted,
  onSort,
  onOpenClose,
  onOpenLink,
  onOpenMutingRule,
}) {
  const headers = [
    'ID',
    'Account',
    'Policy Name',
    'Condition Name',
    'Entity',
    'Title',
    'Description',
    'Priority',
    'Opened At',
    'Duration',
    'Muted',
    ...(hasMuted ? ['Muting Rule'] : []),
    'Close',
    'Links',
  ];

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
            {headers.map((header) => (
              <HeaderCell
                key={header}
                header={header}
                column={column}
                direction={direction}
                hasMuted={hasMuted}
                onSort={onSort}
              />
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.incidentId}>
              <Table.Cell>
                <a href={row.incidentLink} target="_blank" rel="noreferrer">
                  {row.incidentId}
                </a>
              </Table.Cell>
              <Table.Cell>
                <p>{row.accountName}</p>
              </Table.Cell>
              <Table.Cell>
                <div className="cell-wrap">{row.policyName}</div>
              </Table.Cell>
              <Table.Cell>
                <div className="cell-wrap">{row.conditionName}</div>
              </Table.Cell>
              <Table.Cell>
                <div className="cell-wrap">{row.targetName}</div>
              </Table.Cell>
              <Table.Cell>
                <div className="cell-wrap">{row.title}</div>
              </Table.Cell>
              <Table.Cell>
                <div className="cell-wrap">{row.description}</div>
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
                {dayjs(row.openTime).format('MM/DD/YY, h:mm a')}
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
              <Table.Cell>{row.muted.toString()}</Table.Cell>
              {hasMuted && (
                <Table.Cell>
                  <a
                    onClick={() =>
                      onOpenMutingRule(row.mutingRuleName, row.accountId)
                    }
                  >
                    {row.mutingRuleName == null ? '' : row.mutingRuleName}
                  </a>
                </Table.Cell>
              )}
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
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

IncidentsTable.propTypes = {
  rows: PropTypes.array.isRequired,
  column: PropTypes.string,
  direction: PropTypes.string,
  hasMuted: PropTypes.bool.isRequired,
  onSort: PropTypes.func.isRequired,
  onOpenClose: PropTypes.func.isRequired,
  onOpenLink: PropTypes.func.isRequired,
  onOpenMutingRule: PropTypes.func.isRequired,
};

export default memo(IncidentsTable);
