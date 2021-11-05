import { PointType } from 'types';

import { getX, getY } from './getXY';

export const calculateDistance = (pointA: PointType, pointB: PointType): number =>
    Math.sqrt(Math.pow(getX(pointB) - getX(pointA), 2) + Math.pow(getY(pointB) - getY(pointA), 2));