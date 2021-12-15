import uniqid from 'uniqid';

import { getX } from '../helpers';
import { LinePointType, LineType } from './types';

const pointesSorter = (a: LinePointType, b: LinePointType): number =>
  getX(a.point) - getX(b.point) ||
  ((a.orientation === 'vertical' && b.pointType === 'start') || (b.orientation === 'vertical' && a.pointType === 'end')
    ? 1
    : a.pointType === 'start' && a.orientation === 'horizontal'
    ? -1
    : 0);

export const prepareSet = (lines: LineType[]): LinePointType[] =>
  lines
    .reduce((set, [startPoint, endPoint]): LinePointType[] => {
      const [sx, sy] = startPoint;
      const [ex, ey] = endPoint;
      if (sx !== ex && sy !== ey) throw new Error('All lines must either be vertical or horizontal!');

      const lineId = uniqid();
      const orientation = sx === ex ? 'vertical' : 'horizontal';

      return [
        ...set,
        { point: startPoint, lineId, orientation, pointType: 'start' },
        ...(orientation === 'horizontal' ? [{ point: endPoint, lineId, orientation, pointType: 'end' }] : []),
      ] as LinePointType[];
    }, [] as LinePointType[])
    .sort(pointesSorter);
