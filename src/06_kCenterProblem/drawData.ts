import { plot, Plot } from 'nodeplotlib';
import { PlotData } from 'nodeplotlib/dist/lib/models';
import { PointType } from 'types';

import { getX, getY } from '../helpers';

const getCircle = (radius: number, middle: PointType): { x: number[]; y: number[] } => {
  const helper = (
    radius: number,
    middle: PointType,
    step: number = 0,
    x: number[] = [],
    y: number[] = [],
  ): { x: number[]; y: number[] } =>
    step >= 2 * Math.PI
      ? { x, y }
      : helper(
          radius,
          middle,
          step + 0.01,
          [...x, radius * Math.cos(step) + getX(middle)],
          [...y, radius * Math.sin(step) + getY(middle)],
        );
  return helper(radius, middle);
};

export const drawData = (cities: PointType[], centers: PointType[], radius: number): void => {
  const data: Plot[] = [
    {
      x: cities.map(getX),
      y: cities.map(getY),
      mode: 'markers',
      type: 'scatter',
      name: 'Cities',
    },
    {
      x: centers.map(getX),
      y: centers.map(getY),
      mode: 'markers',
      type: 'scatter',
      name: 'Centers',
    },
    ...centers.map(
      c =>
        ({
          ...getCircle(radius, c),
          mode: 'markers',
          type: 'scatter',
          showlegend: false,
          hoverinfo: 'skip',
          marker: {
            size: 1,
          },
        } as PlotData),
    ),
  ];

  plot(data, {
    hovermode: 'closest',
    height: 1000,
    yaxis: {
      scaleanchor: 'x',
    },
  });
};
