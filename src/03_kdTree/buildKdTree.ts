// BuildKdTree(S, d)
// Wejście. Zbiór punktów S i aktualna głębokość d.
// Wyjście. Korzeń kd-drzewa przechowującego zbiór S.
// 1. if S zawiera tylko jeden punkt
// 2. then return liść pamiętający ten punkt
// 3. else if d jest parzyste
// 4. then Podziel S na dwa zbiory S1 i S2 pionową prostą l przechodzącą przez medianę
// then współrzędnych x punktów z S, gdzie S1 zawiera punkty na lewo lub na prostej l,
// then a S2 zawiera punkty na prawo od prostej l.
// 5. else Podziel S na dwa zbiory S1 i S2 poziomą prostą l przechodzącą przez medianę
// then współrzędnych y punktów z S, gdzie S1 zawiera punkty poniżej lub na prostej l,
// then a S2 zawiera punkty powyżej prostej l.
// 6. else lewy-syn(v) := BuildKdTree(S1, d + 1);
// 7. else prawy-syn(v) := BuildKdTree(S2, d + 1);
// 8. else Stwórz wierzchołek v pamietający prostą l, uczyń vlewy i vprawy jego lewym
// else i prawym dzieckiem, odpowiednio.
// 9. return v.

import { AxisType, PointType } from 'types';

import { getX, getY, sortPoints } from '../helpers';
import { getNode, NodeType } from './getNode';

interface SetsType {
  leftSet: PointType[];
  rightSet: PointType[];
}

const getCoordinate = (point: PointType, axis: AxisType): number => (axis === 'X' ? getX(point) : getY(point));

const getMedian = (points: PointType[], axis: AxisType): number => {
  const length = points.length;
  return length % 2 === 0
    ? (getCoordinate(points[length / 2], axis) + getCoordinate(points[(length - 2) / 2], axis)) / 2
    : getCoordinate(points[(length - 1) / 2], axis);
};

const splitPoints = (points: PointType[], axis: AxisType, median: number): SetsType =>
  points.reduce(
    (output, currentPoint) =>
      getCoordinate(currentPoint, axis) <= median
        ? { ...output, leftSet: [...output.leftSet, currentPoint] }
        : { ...output, rightSet: [...output.rightSet, currentPoint] },
    { leftSet: [], rightSet: [] } as SetsType,
  );

export const buildKdTree = (points: PointType[], depth: number = 0): NodeType | null => {
  const pointsLength = points.length;
  const axis: AxisType = depth % 2 === 0 ? 'X' : 'Y';
  const sortedPoints = sortPoints({ points, axis });

  if (pointsLength === 1) {
    return getNode({ point: points[0] });
  } else if (pointsLength === 0) {
    return null;
  }

  const median = getMedian(sortedPoints, axis);

  const { leftSet, rightSet } = splitPoints(sortedPoints, axis, median);
  const leftV = buildKdTree(leftSet, depth + 1);
  const rightV = buildKdTree(rightSet, depth + 1);
  return getNode({
    left: leftV,
    right: rightV,
    line: { coordinate: median, axis },
  });
};
