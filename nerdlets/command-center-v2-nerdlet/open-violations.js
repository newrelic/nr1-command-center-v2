import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  navigation,
  NerdGraphMutation,
  NerdGraphQuery,
  Spinner,
  Toast,
} from 'nr1';
import { Input } from 'semantic-ui-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import orderBy from 'lodash/orderBy';
import csvDownload from 'json-to-csv-export';

import config from './config.json';
import IncidentsTable from './components/IncidentsTable';
import LinkModal from './components/LinkModal';
import ConfirmModal from './components/ConfirmModal';
import useDebouncedValue from './hooks/useDebouncedValue';
import useInterval from './hooks/useInterval';
import useNerdStoreCollection from './hooks/useNerdStoreCollection';

const query = require('./utils');

const COL_MAP = {
  ID: 'incidentId',
  Account: 'accountName',
  'Policy Name': 'policyName',
  'Condition Name': 'conditionName',
  Entity: 'targetName',
  Title: 'title',
  Priority: 'priority',
  'Opened At': 'openTime',
  Duration: 'duration',
  Muting: 'muted',
};

async function fetchViolationIds(acct, time) {
  const res = await NerdGraphQuery.query({
    query: query.openViolations(acct.id, time),
  });
  if (res.error) {
    console.debug(`Failed to retrieve open violations for: ${acct.id}`);
    return { account: acct.name, id: acct.id, violations: null };
  }
  const violations = res.data.actor.account.nrql.results;
  return {
    account: acct.name,
    id: acct.id,
    violations,
  };
}

async function fetchViolationData(aRecord, viosCsv, time) {
  const res = await NerdGraphQuery.query({
    query: query.openViolationData(aRecord.id, viosCsv, time),
  });
  if (res.error) {
    console.debug(
      `Failed to retrieve open violation data for: ${aRecord.account}`
    );
    return [];
  }
  const vioData = res.data.actor.account.nrql.results;
  const now = dayjs();
  for (const vio of vioData) {
    const end = dayjs(vio.openTime);
    vio.duration = dayjs.duration(now.diff(end));
    vio.accountName = aRecord.account;
  }
  return vioData;
}

function buildExportable(formattedTable) {
  return formattedTable.map((row) => ({
    Account: row.accountName,
    'Policy Name': row.policyName,
    'Condition Name': row.conditionName,
    Entity: row.targetName,
    Description: row.title,
    Priority: row.priority,
    'Opened At': dayjs(row.openTime).format('MM/DD/YYYY, h:mm a'),
    Muted: row.muted.toString(),
    MutingRuleId: row.mutingRuleId == null ? null : row.mutingRuleId,
    MutingRuleName: row.mutingRuleName == null ? null : row.mutingRuleName,
    Link: row.link,
  }));
}

function validateLinkInput(displayText, linkText) {
  if (displayText == null || displayText === '') return 'empty';
  if (linkText == null || linkText === '') return 'empty';
  try {
    const parsed = new URL(linkText);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'scheme';
    }
  } catch {
    return 'scheme';
  }
  return null;
}

export default function OpenIncidents({ time, accounts, nerdStoreAccount }) {
  const [openLoading, setOpenLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useState({ column: null, direction: null });

  const [linkModal, setLinkModal] = useState({
    hidden: true,
    rowIncidentId: null,
  });
  const [displayText, setDisplayText] = useState('');
  const [linkText, setLinkText] = useState('');

  const [closeModal, setCloseModal] = useState({
    hidden: true,
    incToClose: null,
    rowAccountId: null,
  });

  const debouncedSearch = useDebouncedValue(searchText, 200);
  const links = useNerdStoreCollection(nerdStoreAccount, 'IncidentLinksV2');

  const accountSignature = useMemo(
    () =>
      accounts
        .map((a) => a.id)
        .sort()
        .join(','),
    [accounts]
  );

  const getTableData = useCallback(async () => {
    const currTime = dayjs().format('h:mm A');
    try {
      const storedLinks = await links.load();
      const idsByAccount = await Promise.all(
        accounts.map((acct) => fetchViolationIds(acct, time))
      );

      const dataChunks = await Promise.all(
        idsByAccount.map((aRecord) => {
          if (!aRecord.violations || aRecord.violations.length === 0) {
            return Promise.resolve([]);
          }
          const csv = aRecord.violations
            .map((v) => `'${v.incidentId}'`)
            .join(',');
          return fetchViolationData(aRecord, csv, time);
        })
      );

      const formattedTable = dataChunks.flat();
      const linksMap = new Map(storedLinks.map((lnk) => [String(lnk.id), lnk]));
      for (const row of formattedTable) {
        const match = linksMap.get(String(row.incidentId));
        row.display = match?.document?.displayText ?? null;
        row.link = match?.document?.linkText ?? null;
      }

      setTableData(formattedTable);
      setCurrentTime(currTime);
      setOpenLoading(false);

      // Remove stale links (incidents no longer open)
      const idSet = new Set(formattedTable.map((r) => String(r.incidentId)));
      for (const lnk of storedLinks) {
        if (!idSet.has(String(lnk.id))) {
          links.remove(lnk.id).catch((err) => console.debug(err));
        }
      }
    } catch (err) {
      console.debug('open-violations fetch failed', err);
      setOpenLoading(false);
    }
  }, [accounts, time, links]);

  useEffect(() => {
    setOpenLoading(true);
    setTableData([]);
    getTableData();
    // eslint-disable-next-line
  }, [time, accountSignature]);

  useInterval(getTableData, config.refreshRate);

  const handleSort = useCallback((clickedCol) => {
    setSort((prev) => ({
      column: clickedCol,
      direction:
        prev.column === clickedCol && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
  }, []);

  const sortedRows = useMemo(() => {
    if (!sort.column) return tableData;
    const field = COL_MAP[sort.column];
    if (!field) return tableData;
    return orderBy(
      tableData,
      [field],
      [sort.direction === 'ascending' ? 'asc' : 'desc']
    );
  }, [tableData, sort]);

  const filteredRows = useMemo(() => {
    const needle = debouncedSearch.toLowerCase();
    if (!needle) return sortedRows;
    return sortedRows.filter(
      (row) =>
        row.accountName.toLowerCase().includes(needle) ||
        row.conditionName.toLowerCase().includes(needle) ||
        row.policyName.toLowerCase().includes(needle) ||
        row.priority.toLowerCase().includes(needle) ||
        row.targetName.toLowerCase().includes(needle) ||
        row.title.toLowerCase().includes(needle)
    );
  }, [sortedRows, debouncedSearch]);

  const exportableRows = useMemo(
    () => buildExportable(filteredRows),
    [filteredRows]
  );

  const hasMuted = useMemo(
    () => filteredRows.some((row) => row.muted === true),
    [filteredRows]
  );

  const openLinkModal = useCallback((row) => {
    setLinkModal({ hidden: false, rowIncidentId: row.incidentId });
  }, []);

  const closeLinkModal = useCallback(() => {
    setLinkModal({ hidden: true, rowIncidentId: null });
    setDisplayText('');
    setLinkText('');
  }, []);

  const saveLink = useCallback(async () => {
    const reason = validateLinkInput(displayText, linkText);
    if (reason) {
      Toast.showToast({
        title:
          reason === 'scheme'
            ? 'Link must be a valid http(s) URL.'
            : 'Input Validation Error! Please review input.',
        type: Toast.TYPE.CRITICAL,
      });
      return;
    }
    const docKey = String(linkModal.rowIncidentId);
    setTableData((prev) =>
      prev.map((row) =>
        row.incidentId === linkModal.rowIncidentId
          ? { ...row, display: displayText, link: linkText }
          : row
      )
    );
    setLinkModal({ hidden: true, rowIncidentId: null });
    try {
      await links.write(docKey, { displayText, linkText });
      Toast.showToast({
        title: 'Incident Link Saved!',
        type: Toast.TYPE.NORMAL,
      });
      setDisplayText('');
      setLinkText('');
    } catch (err) {
      console.debug(err);
      Toast.showToast({ title: err.message, type: Toast.TYPE.CRITICAL });
    }
  }, [displayText, linkText, linkModal.rowIncidentId, links]);

  const openCloseModal = useCallback((row) => {
    setCloseModal({
      hidden: false,
      incToClose: row.incidentId,
      rowAccountId: row['account.id'],
    });
  }, []);

  const cancelCloseModal = useCallback(() => {
    setCloseModal({ hidden: true, incToClose: null, rowAccountId: null });
  }, []);

  const closeIncident = useCallback(async () => {
    const { incToClose, rowAccountId } = closeModal;
    const mutation = `
        mutation {
          aiIssuesCloseIncident(accountId: ${rowAccountId}, incidentId: "${incToClose}") {
            error
            incidentId
            accountId
          }
        }
      `;
    try {
      const res = await NerdGraphMutation.mutate({ mutation });
      if (res.error || res.data?.aiIssuesCloseIncident?.error) {
        console.debug(
          `Failed to close incident: ${incToClose} within account: ${rowAccountId}`
        );
        Toast.showToast({
          title: 'Failed to close incident.',
          type: Toast.TYPE.CRITICAL,
        });
        return;
      }
      setTableData((prev) =>
        prev.filter((row) => row.incidentId !== incToClose)
      );
      setCloseModal({ hidden: true, incToClose: null, rowAccountId: null });
      Toast.showToast({ title: 'Incident closed!', type: Toast.TYPE.NORMAL });
    } catch (err) {
      console.debug(err);
      Toast.showToast({
        title: 'Failed to close incident.',
        type: Toast.TYPE.CRITICAL,
      });
    }
  }, [closeModal]);

  const openMutingRule = useCallback((mutingRuleName, accountId) => {
    navigation.openStackedNerdlet({
      id: 'muting-rules.home',
      urlState: { ruleAccountId: accountId, searchTerm: mutingRuleName },
    });
  }, []);

  if (openLoading && tableData.length === 0) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h4>Loading</h4>
        <Spinner type={Spinner.TYPE.DOT} />
      </div>
    );
  }

  if (!openLoading && tableData.length === 0) {
    return (
      <div>
        <h3>No open incidents found during the time window selected!</h3>
        <span className="refreshLabel">
          Last Refreshed: <strong>{currentTime}</strong>
        </span>
      </div>
    );
  }

  return (
    <>
      <Input
        style={{ marginBottom: '3px' }}
        icon="search"
        placeholder="Search Incidents..."
        onChange={(e) => setSearchText(e.target.value)}
      />
      &nbsp;&nbsp;&nbsp;
      <Button
        className="exportIncidents"
        onClick={() => csvDownload(exportableRows, 'open_incidents.csv')}
        type={Button.TYPE.PRIMARY}
        iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EXPORT}
      >
        Export
      </Button>
      <IncidentsTable
        rows={filteredRows}
        column={sort.column}
        direction={sort.direction}
        hasMuted={hasMuted}
        onSort={handleSort}
        onOpenClose={openCloseModal}
        onOpenLink={openLinkModal}
        onOpenMutingRule={openMutingRule}
      />
      <span className="refreshLabel">
        Last Refreshed: <strong>{currentTime}</strong>
      </span>
      <LinkModal
        hidden={linkModal.hidden}
        displayText={displayText}
        linkText={linkText}
        onChangeDisplay={setDisplayText}
        onChangeLink={setLinkText}
        onSave={saveLink}
        onClose={closeLinkModal}
      />
      <ConfirmModal
        hidden={closeModal.hidden}
        heading="Are you sure you want to close this incident?"
        onConfirm={closeIncident}
        onCancel={cancelCloseModal}
      />
    </>
  );
}

OpenIncidents.propTypes = {
  time: PropTypes.string.isRequired,
  accounts: PropTypes.array.isRequired,
  nerdStoreAccount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};
