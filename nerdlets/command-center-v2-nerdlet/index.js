import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PlatformStateContext, nerdlet } from 'nr1';
import { Dimmer, Loader, Tab } from 'semantic-ui-react';

import Splash from './splash';
import OpenIncidents from './open-violations';
import OpenIssues from './open-issues';
import Analytics from './analytics';
import AccountFilterDropdown from './components/AccountFilterDropdown';
import useAccounts from './hooks/useAccounts';

function deriveTimeRange(platformUrlState) {
  if (!platformUrlState?.timeRange) return { since: '', rawTime: null };
  const tr = platformUrlState.timeRange;
  if (tr.duration) {
    return {
      since: ` SINCE ${tr.duration / 60 / 1000} MINUTES AGO`,
      rawTime: { durationMs: tr.duration },
    };
  }
  if (tr.begin_time && tr.end_time) {
    return {
      since: ` SINCE ${tr.begin_time} until ${tr.end_time}`,
      rawTime: { startTime: tr.begin_time, endTime: tr.end_time },
    };
  }
  return { since: '', rawTime: null };
}

export default function CommandCenterV2NerdletNerdlet() {
  const { accounts, loading } = useAccounts();
  const [filteredAccounts, setFilteredAccounts] = useState([]);

  const platformUrlState = useContext(PlatformStateContext);

  useEffect(() => {
    nerdlet.setConfig({
      timePickerDefaultOffset: 1000 * 60 * 60 * 24,
    });
  }, []);

  useEffect(() => {
    setFilteredAccounts(accounts);
  }, [accounts]);

  const handleChange = useCallback(
    (e, { value }) => {
      if (value.length > 0) {
        setFilteredAccounts(accounts.filter((a) => value.includes(a.id)));
      } else {
        setFilteredAccounts(accounts);
      }
    },
    [accounts]
  );

  const { since, rawTime } = useMemo(
    () => deriveTimeRange(platformUrlState),
    [platformUrlState]
  );

  const panes = useMemo(
    () => [
      {
        menuItem: 'Overview',
        render: () => (
          <Tab.Pane>
            <Splash
              time={since}
              rawTime={rawTime}
              accounts={filteredAccounts}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Open Issues',
        render: () => (
          <Tab.Pane>
            <OpenIssues
              time={since}
              rawTime={rawTime}
              accounts={filteredAccounts}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Open Alert Events',
        render: () => (
          <Tab.Pane>
            <OpenIncidents
              time={since}
              accounts={filteredAccounts}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Analytics',
        render: () => (
          <Tab.Pane>
            <Analytics
              time={since}
              accounts={filteredAccounts}
            />
          </Tab.Pane>
        ),
      },
    ],
    [since, rawTime, filteredAccounts]
  );

  if (loading) {
    return (
      <Dimmer active={loading}>
        <Loader size="medium">Loading</Loader>
      </Dimmer>
    );
  }

  if (accounts.length === 0) {
    return <h3>Accounts could not be retrieved!</h3>;
  }

  return (
    <>
      <AccountFilterDropdown accounts={accounts} onChange={handleChange} />
      <Tab panes={panes} />
    </>
  );
}
