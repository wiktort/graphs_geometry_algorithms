import { AxisType, PointType } from 'types';

import { getX, getY } from './getXY';

interface Props {
    points: PointType[];
    axis: AxisType;
    order?: 'ASC' | 'DESC';
};

export const sortPoints = ({points, axis, order = 'ASC'}: Props): PointType[] => {
    const getCoordinate = axis === 'X' ? getX : getY;
    const delta = order === 'ASC' ? 1 : -1;
    const sortedPoints = [...points]
        .sort((p1, p2) => (getCoordinate(p1) - getCoordinate(p2)) * delta);
    return sortedPoints;
};