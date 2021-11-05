import { PointType } from 'types';

import { getX, sortPoints } from '../helpers.ts';

interface MaxAndMinXType {
    xMin: number;
    xMax: number;
}

export const getMaxAndMinX = (points: PointType[]): MaxAndMinXType  => {
    const sortedPoints = sortPoints({points, axis: 'X'});
    return {
      xMin: getX(sortedPoints[0]),
      xMax: getX(sortedPoints[points.length - 1]),
    };
};

