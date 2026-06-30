import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { NerdGraphQuery, Spinner } from 'nr1';
import { Card, Input } from 'semantic-ui-react';
import orderBy from 'lodash/orderBy';

import AccountCard from './components/AccountCard';
import SortDropdown from './components/SortDropdown';
import useDebouncedValue from './hooks/useDebouncedValue';

const query = require('./utils');

const SORT_ITEMS = ['A-Z', 'Z-A', 'Critical', 'High', 'Muted', 'Healthy'];

function getCardColor(card) {
  if (card.critical >= 1) return 'red';
  if ((card.high >= 1 || card.anomalyCount >= 1) && card.critical === 0)
    return 'orange';
  if (card.critical === 0 || card.high === 0 || card.anomalyCount === 0)
    return 'green';
  return undefined;
}

function getIcon(card) {
  if (card.critical >= 1) return 'ban';
  if ((card.high >= 1 || card.anomalyCount >= 1) && card.critical === 0)
    return 'exclamation circle';
  if (card.critical === 0 || card.high === 0 || card.anomalyCount === 0)
    return 'check circle';
  return undefined;
}

function countPriorities(issues) {
  let critical = 0;
  let high = 0;
  let muted = 0;
  for (const issue of issues) {
    let p = null;
    let m = null;
    for (const tag of issue.tags) {
      if (tag.key === 'priority') p = tag.values[0];
      else if (tag.key === 'mutingState') m = tag.values[0];
    }
    if (p === 'CRITICAL') critical++;
    else if (p === 'HIGH') high++;
    if (m === 'FULLY_MUTED') muted++;
  }
  return { critical, high, muted };
}

async function fetchIssueCountsForAccount(acct) {
  let cursor = null;
  let collected = [];
  do {
    const result = await NerdGraphQuery.query({
      query: query.issuesByPriority(acct.id, cursor),
    });
    if (result.error) {
      console.debug(`Failed fetching issues for account: ${acct.id}`);
      console.debug(result.error);
      return null;
    }
    const entities = result.data.actor.entitySearch.results.entities;
    collected = collected.concat(entities);
    cursor = result.data.actor.entitySearch.results.nextCursor;
  } while (cursor != null);

  const counts = countPriorities(collected);
  return {
    account: acct.name,
    id: acct.id,
    high: counts.high,
    critical: counts.critical,
    muted: counts.muted,
  };
}

export default function Splash({ accounts }) {
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState([]);
  const [sortDisplay, setSortDisplay] = useState('Sort by');
  const [searchText, setSearchText] = useState('');

  const debouncedSearch = useDebouncedValue(searchText, 150);

  const accountSignature = useMemo(
    () =>
      accounts
        .map((a) => a.id)
        .sort()
        .join(','),
    [accounts]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setCardData([]);
    const proms = accounts.map((a) => fetchIssueCountsForAccount(a));
    Promise.all(proms)
      .then((results) => {
        if (!active) return;
        setCardData(results.filter((r) => r != null));
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.debug('splash fetch failed', err);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accountSignature]); // eslint-disable-line

  const handleSort = useCallback((e, item) => {
    setSortDisplay(item ?? e?.target?.textContent ?? 'Sort by');
  }, []);

  const handleCardClick = useCallback((e) => {
    const here = window.location.href;
    const base = here.includes('one.eu')
      ? 'https://one.eu.newrelic.com'
      : 'https://one.newrelic.com';
    const url = `${base}/alerts-ai?account=${e.currentTarget.id}&duration=86400000`;
    window.open(url, '_blank');
  }, []);

  const sortedCards = useMemo(() => {
    if (sortDisplay === 'A-Z') {
      return orderBy(cardData, [(c) => c.account.toLowerCase()], ['asc']);
    }
    if (sortDisplay === 'Z-A') {
      return orderBy(cardData, [(c) => c.account.toLowerCase()], ['desc']);
    }
    if (sortDisplay === 'Critical') {
      return orderBy(cardData, ['critical'], ['desc']);
    }
    if (sortDisplay === 'High') {
      return orderBy(cardData, ['high'], ['desc']);
    }
    if (sortDisplay === 'Muted') {
      return orderBy(cardData, ['muted'], ['desc']);
    }
    if (sortDisplay === 'Healthy') {
      return orderBy(
        cardData,
        ['critical', 'high', 'anomalyCount'],
        ['asc', 'asc', 'asc']
      );
    }
    return cardData;
  }, [cardData, sortDisplay]);

  const visibleCards = useMemo(() => {
    const needle = debouncedSearch.toLowerCase();
    if (!needle) return sortedCards;
    return sortedCards.filter(
      (card) =>
        card.account.toLowerCase().includes(needle) ||
        card.id.toString().includes(needle)
    );
  }, [sortedCards, debouncedSearch]);

  if (loading || cardData.length === 0) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h4>Loading</h4>
        <Spinner type={Spinner.TYPE.DOT} />
      </div>
    );
  }

  return (
    <>
      <SortDropdown
        sortDisplay={sortDisplay}
        items={SORT_ITEMS}
        onSelect={handleSort}
      />
      <Input
        style={{ marginBottom: '3px' }}
        icon="search"
        placeholder="Search Accounts..."
        onChange={(e) => setSearchText(e.target.value)}
      />
      &nbsp;&nbsp;&nbsp;
      {visibleCards.length > 0 ? (
        <Card.Group style={{ textAlign: 'center' }} itemsPerRow={3}>
          {visibleCards.map((card) => {
            const color = getCardColor(card);
            const icon = getIcon(card);
            return (
              <AccountCard
                key={card.id}
                card={card}
                color={color}
                icon={icon}
                onClick={handleCardClick}
              />
            );
          })}
        </Card.Group>
      ) : (
        'No Accounts Found'
      )}
    </>
  );
}

Splash.propTypes = {
  accounts: PropTypes.array.isRequired,
};
