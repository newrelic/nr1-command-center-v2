import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Card, Icon, Statistic } from 'semantic-ui-react';

function AccountCard({ card, color, icon, onClick }) {
  return (
    <Card key={card.id} id={card.id} onClick={onClick} color={color}>
      <Card.Header>
        <h2 style={{ color }}>
          <Icon name={icon} />
          {card.account}
        </h2>
      </Card.Header>
      <Card.Content>
        <Statistic.Group
          style={{ textAlign: 'center', display: 'inline-flex' }}
        >
          <Statistic size="mini" color={color}>
            <Statistic.Value>
              {card.critical == null ? 0 : card.critical}
            </Statistic.Value>
            <Statistic.Label>Critical</Statistic.Label>
          </Statistic>
          <Statistic size="mini" color={color}>
            <Statistic.Value>
              {card.high == null ? 0 : card.high}
            </Statistic.Value>
            <Statistic.Label>High</Statistic.Label>
          </Statistic>
          <Statistic size="mini" color={color}>
            <Statistic.Value>
              {card.muted == null ? 0 : card.muted}
            </Statistic.Value>
            <Statistic.Label>Muted</Statistic.Label>
          </Statistic>
        </Statistic.Group>
      </Card.Content>
    </Card>
  );
}

AccountCard.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    account: PropTypes.string.isRequired,
    critical: PropTypes.number,
    high: PropTypes.number,
    muted: PropTypes.number,
  }).isRequired,
  color: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default memo(AccountCard);
