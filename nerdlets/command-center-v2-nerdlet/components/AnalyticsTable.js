import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

const HEADERS = [
  'Account',
  'Account ID',
  'Issue Count',
  'Issue Minutes (accumulated)',
  'Avg Issue MTTR (minutes)',
  '% Issues closed under 5min',
];

function AnalyticsTable({ rows, column, direction, onSort, onOpenDrilldown }) {
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
            {HEADERS.map((header, k) => (
              <Table.HeaderCell
                key={k}
                sorted={column === header ? direction : undefined}
                onClick={() => onSort(header)}
              >
                {header}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.id}>
              <Table.Cell onClick={() => onOpenDrilldown(row)}><a>{row.account}</a></Table.Cell>
              <Table.Cell>{row.id}</Table.Cell>
              <Table.Cell>{row.issueCount}</Table.Cell>
              <Table.Cell>{Math.round(row.issueMin)}</Table.Cell>
              <Table.Cell>
                {row.issueMTTR == null ? 'n/a' : Math.round(row.issueMTTR)}
              </Table.Cell>
              <Table.Cell>
                {row.issueUnder5 == null ? 'n/a' : row.issueUnder5.toFixed(2)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

AnalyticsTable.propTypes = {
  rows: PropTypes.array.isRequired,
  column: PropTypes.string,
  direction: PropTypes.string,
  onSort: PropTypes.func.isRequired,
  onOpenDrilldown: PropTypes.func.isRequired,
};

export default memo(AnalyticsTable);
