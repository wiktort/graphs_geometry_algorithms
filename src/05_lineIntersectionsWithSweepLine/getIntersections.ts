import createRBTree, { Tree } from 'functional-red-black-tree';
import { PointType } from 'types';

import { getX } from '../helpers';
import { LinePointType } from './types';

export const getIntersections = (linePoints: LinePointType[]): PointType[] => {
  const helper = (
    linePoints: LinePointType[],
    tree: Tree<string, PointType> = createRBTree(),
    intersections: PointType[] = [],
  ): PointType[] => {
    const [currentPoint] = linePoints;

    if (!linePoints.length) return intersections;

    if (currentPoint.orientation === 'horizontal')
      return [
        ...helper(
          linePoints.slice(1),
          currentPoint.pointType === 'start'
            ? tree.insert(currentPoint.lineId, currentPoint.point)
            : tree.remove(currentPoint.lineId),
          intersections,
        ),
      ];

    return [
      ...helper(linePoints.slice(1), tree, [
        ...intersections,
        ...tree.values.map(([, y]) => [getX(currentPoint.point), y]),
      ] as PointType[]),
    ];
  };
  return helper(linePoints);
};
