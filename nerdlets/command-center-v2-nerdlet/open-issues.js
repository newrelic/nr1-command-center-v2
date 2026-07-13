import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  NerdGraphMutation,
  NerdGraphQuery,
  Spinner,
  Toast,
  UserQuery,
} from 'nr1';
import { Input } from 'semantic-ui-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import orderBy from 'lodash/orderBy';
import csvDownload from 'json-to-csv-export';

import { DEFAULT_REFRESH_RATE } from './constants';
import IssuesTable from './components/IssuesTable';
import LinkModal from './components/LinkModal';
import ConfirmModal from './components/ConfirmModal';
import EntitiesModal from './components/EntitiesModal';
import useCurrentUser from './hooks/useCurrentUser';
import useDebouncedValue from './hooks/useDebouncedValue';
import useInterval from './hooks/useInterval';
import useNerdStoreCollection from './hooks/useNerdStoreCollection';

const query = require('./utils');

const COL_MAP = {
  ID: 'issueId',
  Account: 'accountName',
  '# Entities': (row) => (row.relatedEntityId ? row.relatedEntityId.length : 0),
  Title: 'name',
  '# Alert Events': 'incidentCount',
  Priority: 'priority',
  'Opened At': 'activatedAt',
  Duration: 'duration',
  Muted: 'mutingState',
};

const NUMERIC_TAG_KEYS = new Set([
  'activatedAt',
  'accountId',
  'incidentCount',
  'policyId',
  'conditionId',
]);
const ARRAY_TAG_KEYS = new Set(['relatedEntityName', 'relatedEntityId']);

function applyTagsToIssue(issue) {
  for (const tag of issue.tags) {
    const { key } = tag;
    if (NUMERIC_TAG_KEYS.has(key)) {
      issue[key] = Number(tag.values[0]);
    } else if (ARRAY_TAG_KEYS.has(key)) {
      issue[key] = tag.values;
    } else {
      issue[key] = tag.values[0];
    }
  }
}

async function fetchAllIssuesForAccount(acct) {
  let cursor = null;
  let collected = [];
  do {
    const res = await NerdGraphQuery.query({
      query: query.openIssues(acct.id, cursor),
    });
    if (res.error) {
      console.debug(`Failed to retrieve open issues for: ${acct.id}`);
      console.debug(res.error);
      return { account: acct.name, id: acct.id, issues: [] };
    }
    collected = collected.concat(res.data.actor.entitySearch.results.entities);
    cursor = res.data.actor.entitySearch.results.nextCursor;
  } while (cursor != null);
  return { account: acct.name, id: acct.id, issues: collected };
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

function buildBaseUrl() {
  const here = window.location.href;
  return here.includes('one.eu')
    ? 'https://radar-api.service.eu.newrelic.com'
    : 'https://radar-api.service.newrelic.com';
}

export default function OpenIssues({ accounts }) {
  const [openLoading, setOpenLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useState({ column: null, direction: null });

  const [linkModal, setLinkModal] = useState({
    hidden: true,
    rowIssueId: null,
    rowAccountId: null,
  });
  const [displayText, setDisplayText] = useState('');
  const [linkText, setLinkText] = useState('');

  const [ackModal, setAckModal] = useState({
    hidden: true,
    issueToAck: null,
    rowAccountId: null,
  });

  const [closeModal, setCloseModal] = useState({
    hidden: true,
    issueToClose: null,
    rowAccountId: null,
  });

  const [entityModal, setEntityModal] = useState({
    hidden: true,
    loading: false,
    entities: [],
  });

  const debouncedSearch = useDebouncedValue(searchText, 200);
  const linksStore = useNerdStoreCollection('IssueLinks');
  const acksStore = useNerdStoreCollection('IssueAcksV2');
  const { fetchUserName } = useCurrentUser();

  const baseUrl = useMemo(() => buildBaseUrl(), []);

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
      const accountIds = accounts.map((a) => a.id);
      const [storedLinks, storedAcks, perAccount] = await Promise.all([
        linksStore.load(accountIds),
        acksStore.load(accountIds),
        Promise.all(accounts.map((acct) => fetchAllIssuesForAccount(acct))),
      ]);

      // First pass: collect distinct system-ack user IDs
      const distinctAckIds = new Set();
      for (const acctData of perAccount) {
        for (const issue of acctData.issues) {
          if (issue.acknowledgedBy) distinctAckIds.add(issue.acknowledgedBy);
        }
      }
      // Resolve all in parallel and build a Map for O(1) lookup below
      const userNameEntries = await Promise.all(
        Array.from(distinctAckIds).map(async (id) => [
          id,
          await fetchUserName(id),
        ])
      );
      const userNamesMap = new Map(userNameEntries);

      const flatTable = [];
      const now = dayjs();
      const linksMap = new Map(storedLinks.map((lnk) => [String(lnk.id), lnk]));
      const acksMap = new Map(storedAcks.map((ack) => [String(ack.id), ack]));

      for (const acctData of perAccount) {
        for (const issue of acctData.issues) {
          issue.accountName = acctData.account;
          applyTagsToIssue(issue);

          const activatedSec = Number(issue.activatedAt) / 1000;
          issue.duration = dayjs.duration(now.diff(dayjs.unix(activatedSec)));

          const matchedLink = linksMap.get(String(issue.issueId));
          issue.display = matchedLink?.document?.displayText ?? null;
          issue.link = matchedLink?.document?.linkText ?? null;

          if (issue.acknowledgedBy) {
            issue.ackUser = userNamesMap.get(issue.acknowledgedBy) || null;
          } else {
            const matchedAck = acksMap.get(String(issue.issueId));
            issue.ackUser = matchedAck?.document?.user ?? null;
          }

          flatTable.push(issue);
        }
      }

      const sortedTable = orderBy(flatTable, ['activatedAt'], ['desc']);
      setTableData(sortedTable);
      setCurrentTime(currTime);
      setOpenLoading(false);

      // Prune stale NerdStore entries
      const idSet = new Set(sortedTable.map((r) => String(r.issueId)));
      for (const lnk of storedLinks) {
        if (!idSet.has(String(lnk.id))) {
          linksStore
            .remove(lnk.id, lnk.accountId)
            .catch((err) => console.debug(err));
        }
      }
      for (const ack of storedAcks) {
        if (!idSet.has(String(ack.id))) {
          acksStore
            .remove(ack.id, ack.accountId)
            .catch((err) => console.debug(err));
        }
      }
    } catch (err) {
      console.debug('open-issues fetch failed', err);
      setOpenLoading(false);
    }
  }, [accounts, linksStore, acksStore, fetchUserName]);

  useEffect(() => {
    setOpenLoading(true);
    setTableData([]);
    getTableData();
    // eslint-disable-next-line
  }, [accountSignature]);

  useInterval(getTableData, DEFAULT_REFRESH_RATE);

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
    const accessor = COL_MAP[sort.column];
    if (!accessor) return tableData;
    return orderBy(
      tableData,
      [accessor],
      [sort.direction === 'ascending' ? 'asc' : 'desc']
    );
  }, [tableData, sort]);

  const filteredRows = useMemo(() => {
    const needle = debouncedSearch.toLowerCase();
    if (!needle) return sortedRows;
    return sortedRows.filter(
      (row) =>
        row.accountName.toLowerCase().includes(needle) ||
        row.priority.toLowerCase().includes(needle) ||
        row.name.toLowerCase().includes(needle) ||
        (row.mutingState || '').toLowerCase().includes(needle) ||
        (row.relatedEntityName ?? '').toString().toLowerCase().includes(needle)
    );
  }, [sortedRows, debouncedSearch]);

  const exportableRows = useMemo(
    () =>
      filteredRows.map((row) => ({
        Account: row.accountName,
        Title: row.name,
        IncidentCount: row.incidentCount,
        Entities:
          row.relatedEntityName != null ? row.relatedEntityName.toString() : '',
        Priority: row.priority,
        Muted: row.mutingState,
        'Opened At': dayjs
          .unix(row.activatedAt / 1000)
          .format('MM/DD/YYYY, h:mm a'),
        Link: row.link,
      })),
    [filteredRows]
  );

  const openLinkModal = useCallback((row) => {
    setLinkModal({
      hidden: false,
      rowIssueId: row.issueId,
      rowAccountId: row.accountId,
    });
  }, []);

  const closeLinkModal = useCallback(() => {
    setLinkModal({ hidden: true, rowIssueId: null, rowAccountId: null });
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
    const docKey = String(linkModal.rowIssueId);
    setTableData((prev) =>
      prev.map((row) =>
        String(row.issueId) === docKey
          ? { ...row, display: displayText, link: linkText }
          : row
      )
    );
    setLinkModal({ hidden: true, rowIssueId: null, rowAccountId: null });
    try {
      await linksStore.write(
        docKey,
        { displayText, linkText },
        linkModal.rowAccountId
      );
      Toast.showToast({ title: 'Issue Link Saved!', type: Toast.TYPE.NORMAL });
      setDisplayText('');
      setLinkText('');
    } catch (err) {
      console.debug(err);
      Toast.showToast({ title: err.message, type: Toast.TYPE.CRITICAL });
    }
  }, [
    displayText,
    linkText,
    linkModal.rowIssueId,
    linkModal.rowAccountId,
    linksStore,
  ]);

  const openAckModal = useCallback((row) => {
    setAckModal({
      hidden: false,
      issueToAck: row.issueId,
      rowAccountId: row.accountId,
    });
  }, []);

  const cancelAckModal = useCallback(() => {
    setAckModal({ hidden: true, issueToAck: null, rowAccountId: null });
  }, []);

  const ackIssue = useCallback(async () => {
    const { issueToAck, rowAccountId } = ackModal;
    if (issueToAck == null) return;
    let currentUserData;
    try {
      currentUserData = await UserQuery.query();
    } catch (err) {
      console.debug(err);
      Toast.showToast({
        title: 'Failed to fetch current user.',
        type: Toast.TYPE.CRITICAL,
      });
      return;
    }
    const userName = currentUserData?.data?.name;

    const mutation = `
        mutation {
          aiIssuesAckIssue(accountId: ${rowAccountId}, issueId: "${issueToAck}") {
            error
            result {
              action
              issueId
              accountId
            }
          }
        }
      `;

    try {
      const res = await NerdGraphMutation.mutate({ mutation });

      if (res.error) {
        console.debug(
          `Failed to ack issue: ${issueToAck} within account: ${rowAccountId}`
        );
        console.debug(res.error);
        Toast.showToast({
          title: 'Failed to ack issue.',
          type: Toast.TYPE.CRITICAL,
        });
        return;
      }

      if (res.data?.aiIssuesAckIssue?.error) {
        console.debug(
          `Failed to ack issue: ${issueToAck} within account: ${rowAccountId}`
        );
        console.debug(res.data.aiIssuesAckIssue.error);
        Toast.showToast({
          title: 'Failed to ack issue.',
          type: Toast.TYPE.CRITICAL,
        });
        return;
      }

      setTableData((prev) =>
        prev.map((row) =>
          row.issueId === issueToAck ? { ...row, ackUser: userName } : row
        )
      );
      setAckModal({ hidden: true, issueToAck: null, rowAccountId: null });
      try {
        await acksStore.write(issueToAck, { user: userName }, rowAccountId);
        Toast.showToast({
          title: 'Issue acknowledged!',
          type: Toast.TYPE.NORMAL,
        });
      } catch (err) {
        console.debug(err);
        Toast.showToast({ title: err.message, type: Toast.TYPE.CRITICAL });
      }
    } catch (err) {
      console.debug(err);
      Toast.showToast({
        title: 'Failed to ack issue.',
        type: Toast.TYPE.CRITICAL,
      });
    }
  }, [ackModal, acksStore]);

  const openCloseModal = useCallback((row) => {
    setCloseModal({
      hidden: false,
      issueToClose: row.issueId,
      rowAccountId: row.accountId,
    });
  }, []);

  const cancelCloseModal = useCallback(() => {
    setCloseModal({ hidden: true, issueToClose: null, rowAccountId: null });
  }, []);

  const closeIssue = useCallback(async () => {
    const { issueToClose, rowAccountId } = closeModal;
    const mutation = `
        mutation {
          aiIssuesResolveIssue(accountId: ${rowAccountId}, issueId: "${issueToClose}") {
            error
            result {
              action
              issueId
              accountId
            }
          }
        }
      `;
    try {
      const res = await NerdGraphMutation.mutate({ mutation });

      if (res.error) {
        console.debug(
          `Failed to close issue: ${issueToClose} within account: ${rowAccountId}`
        );
        console.debug(res.error);
        Toast.showToast({
          title: 'Failed to close issue.',
          type: Toast.TYPE.CRITICAL,
        });
        return;
      }

      if (res.data?.aiIssuesResolveIssue?.error) {
        console.debug(
          `Failed to close issue: ${issueToClose} within account: ${rowAccountId}`
        );
        console.debug(res.data.aiIssuesResolveIssue.error);
        Toast.showToast({
          title: 'Failed to close issue.',
          type: Toast.TYPE.CRITICAL,
        });
        return;
      }

      setTableData((prev) =>
        prev.filter((row) => row.issueId !== issueToClose)
      );
      setCloseModal({ hidden: true, issueToClose: null, rowAccountId: null });
      const docKey = String(issueToClose);
      linksStore.remove(docKey, rowAccountId).catch(console.debug);
      acksStore.remove(docKey, rowAccountId).catch(console.debug);
      Toast.showToast({ title: 'Issue closed!', type: Toast.TYPE.NORMAL });
    } catch (err) {
      console.debug(err);
      Toast.showToast({
        title: 'Failed to close issue.',
        type: Toast.TYPE.CRITICAL,
      });
    }
  }, [closeModal, linksStore, acksStore]);

  const openEntitiesModal = useCallback(async (entityIds) => {
    const ids = entityIds || [];
    setEntityModal({ hidden: false, loading: true, entities: [] });

    const chunks = [];
    for (let i = 0; i < ids.length; i += 25) {
      chunks.push(ids.slice(i, i + 25));
    }

    try {
      const results = await Promise.all(
        chunks.map((chunk) =>
          NerdGraphQuery.query({
            query: query.entityStatusByIssue(chunk.join('","')),
          })
        )
      );
      const flatEntities = results.flatMap((res) => {
        if (res.error) {
          console.debug('Failed to fetch entity status chunk');
          console.debug(res.error);
          return [];
        }
        return res.data.actor.entities || [];
      });
      setEntityModal({ hidden: false, loading: false, entities: flatEntities });
    } catch (err) {
      console.debug(err);
      setEntityModal({ hidden: false, loading: false, entities: [] });
    }
  }, []);

  const closeEntitiesModal = useCallback(() => {
    setEntityModal({ hidden: true, loading: false, entities: [] });
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
        placeholder="Search Issues..."
        onChange={(e) => setSearchText(e.target.value)}
      />
      &nbsp;&nbsp;&nbsp;
      <Button
        className="exportIncidents"
        onClick={() => csvDownload(exportableRows, 'open_issues.csv')}
        type={Button.TYPE.PRIMARY}
        iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EXPORT}
      >
        Export
      </Button>
      <IssuesTable
        rows={filteredRows}
        column={sort.column}
        direction={sort.direction}
        baseUrl={baseUrl}
        onSort={handleSort}
        onOpenAck={openAckModal}
        onOpenClose={openCloseModal}
        onOpenLink={openLinkModal}
        onOpenEntities={openEntitiesModal}
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
        hidden={ackModal.hidden}
        heading="Are you sure you want to acknowledge this issue?"
        onConfirm={ackIssue}
        onCancel={cancelAckModal}
      />
      <ConfirmModal
        hidden={closeModal.hidden}
        heading="Are you sure you want to close this issue?"
        onConfirm={closeIssue}
        onCancel={cancelCloseModal}
      />
      <EntitiesModal
        hidden={entityModal.hidden}
        loading={entityModal.loading}
        entities={entityModal.entities}
        onClose={closeEntitiesModal}
      />
    </>
  );
}

OpenIssues.propTypes = {
  accounts: PropTypes.array.isRequired,
};
