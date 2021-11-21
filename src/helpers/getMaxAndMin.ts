import { AxisType, PointType } from 'types';

import { getX, sortPoints } from './';
import { getY } from './getXY';

interface MaxAndMinXType {
    min: number;
    max: number;
}

export const getMaxAndMin = (points: PointType[], axis: AxisType): MaxAndMinXType  => {
    const sortedPoints = sortPoints({points, axis});
    const getCoordinate = axis === 'X' ? getX : getY;
    return {
      min: getCoordinate(sortedPoints[0]),
      max: getCoordinate(sortedPoints[points.length - 1]),
    };
};

