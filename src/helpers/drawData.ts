import { Plot, plot } from 'nodeplotlib';
import { PointType } from 'types';

import { AreaType } from '03_kdTree/getArea';

import { getX, getY } from './getXY';

export const drawData = (points: PointType[], { pMax, pMin }: AreaType, includedPoints: PointType[]) => {
  const data: Plot[] = [
    {
      x: points.map(getX),
      y: points.map(getY),
      mode: 'markers',
      type: 'scatter',
      name: 'All points',
    },
    {
      x: [getX(pMin), getX(pMax), getX(pMax), getX(pMin), getX(pMin)],
      y: [getY(pMin), getY(pMin), getY(pMax), getY(pMax), getY(pMin)],
      type: 'scatter',
      name: 'Rectangle',
    },
    {
      x: includedPoints.map(getX),
      y: includedPoints.map(getY),
      mode: 'markers',
      type: 'scatter',
      name: 'Included points',
    },
  ];
  plot(data);
};
