import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownItem } from 'nr1';

function SortDropdown({ sortDisplay, items, onSelect }) {
  return (
    <div className="sortBy">
      <Dropdown
        type={Dropdown.TYPE.NORMAL}
        title={sortDisplay}
        iconType={Dropdown.ICON_TYPE.INTERFACE__ARROW__SORT}
        items={items}
      >
        {({ item }) => (
          <DropdownItem key={item} onClick={(e) => onSelect(e, item)}>
            {item}
          </DropdownItem>
        )}
      </Dropdown>
    </div>
  );
}

SortDropdown.propTypes = {
  sortDisplay: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default memo(SortDropdown);
