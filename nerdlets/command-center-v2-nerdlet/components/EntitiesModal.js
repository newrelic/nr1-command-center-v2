import React from 'react';
import PropTypes from 'prop-types';
import { Button, HeadingText, Modal, Spinner } from 'nr1';

import { STATUSES } from '../constants';

export default function EntitiesModal({ hidden, loading, entities, onClose }) {
  return (
    <Modal hidden={hidden} onClose={onClose}>
      <HeadingText>
        <strong>Related Entities</strong>
      </HeadingText>
      <div
        style={{
          maxHeight: '600px',
          overflowY: 'auto',
          marginBottom: '12px',
        }}
      >
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
          <ul>
            {entities.map((entity) => (
              <li style={{ marginBottom: '4px' }} key={entity.guid}>
                <div style={{ display: 'inline-flex' }}>
                  <div
                    className={`status-icon-small ${STATUSES[entity.alertSeverity]}`}
                  />
                  <a href={entity.permalink} target="_blank" rel="noreferrer">
                    {entity.name}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button type={Button.TYPE.PRIMARY} className="modalBtn" onClick={onClose}>
        Close
      </Button>
    </Modal>
  );
}

EntitiesModal.propTypes = {
  hidden: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  entities: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};
