import { Plot, plot } from 'nodeplotlib';
import { PointType } from 'types';

import { getX, getY } from '../helpers';
import { LineType } from './types';

export const drawData = (lines: LineType[], intersections: PointType[]) => {
  const data: Plot[] = [
    ...(lines.map(([startPoint, endPoint]) => ({
      x: [getX(startPoint), getX(endPoint)],
      y: [getY(startPoint), getY(endPoint)],
      type: 'scatter',
      showlegend: false,
      hoverinfo: 'skip',
    })) as Plot[]),
    {
      x: intersections.map(getX),
      y: intersections.map(getY),
      mode: 'markers',
      type: 'scatter',
      name: 'Intersection',
    },
  ];
  plot(data, { hovermode: 'closest' });
};
