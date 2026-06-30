import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'nr1';
import { Dropdown, Icon } from 'semantic-ui-react';

const TOOLTIP_TEXT =
  'Global multi-account selection - Selected accounts will persist across all tabs. Useful for targeting a specific set of accounts.';

function AccountFilterDropdown({ accounts, onChange }) {
  const options = useMemo(
    () => accounts.map((a) => ({ key: a.id, text: a.name, value: a.id })),
    [accounts]
  );

  return (
    <div>
      <Tooltip text={TOOLTIP_TEXT} placementType={Tooltip.PLACEMENT_TYPE.RIGHT}>
        <Icon size="large" name="help circle" />
      </Tooltip>
      <Dropdown
        style={{ marginBottom: '6px' }}
        placeholder="Global Account Filter"
        multiple
        search
        selection
        options={options}
        onChange={onChange}
      />
    </div>
  );
}

AccountFilterDropdown.propTypes = {
  accounts: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default memo(AccountFilterDropdown);
