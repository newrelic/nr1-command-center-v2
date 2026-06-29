import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'nr1';
import { Card, Icon, Statistic } from 'semantic-ui-react';

function AnalyticsStats({ aggregateData, getTooltip }) {
  return (
    <Card.Group
      style={{ textAlign: 'center', marginBottom: '10px' }}
      itemsPerRow={4}
    >
      {Object.keys(aggregateData).map((dp) => (
        <Card key={dp}>
          <Card.Header textAlign="center">
            <h3>
              <Tooltip
                text={getTooltip(dp)}
                placementType={Tooltip.PLACEMENT_TYPE.RIGHT}
              >
                <Icon name="help circle" />
              </Tooltip>
              {dp}
            </h3>
          </Card.Header>
          <Card.Content>
            <Statistic size="mini">
              <Statistic.Value>
                {dp.includes('%')
                  ? aggregateData[dp].toFixed(2)
                  : Math.round(aggregateData[dp])}
              </Statistic.Value>
            </Statistic>
          </Card.Content>
        </Card>
      ))}
    </Card.Group>
  );
}

AnalyticsStats.propTypes = {
  aggregateData: PropTypes.object.isRequired,
  getTooltip: PropTypes.func.isRequired,
};

export default memo(AnalyticsStats);
