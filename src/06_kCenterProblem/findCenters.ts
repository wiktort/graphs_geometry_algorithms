import { PointType } from 'types';

import { calculateDistance, removeItem } from '../helpers';

const getCenter = (
  cities: PointType[],
  centers: PointType[],
  nextCenter?: PointType,
  maxDistance: number = 0,
): PointType => {
  if (!cities.length) {
    return nextCenter!;
  }

  const city = cities[0];
  const currentDistance = Math.min(...centers.map(c => calculateDistance(c, city)));
  return getCenter(
    cities.slice(1),
    centers,
    currentDistance > maxDistance ? city : nextCenter,
    Math.max(currentDistance, maxDistance),
  );
};

export const furthestFirst = (
  numberOfCenters: number,
  cities: PointType[],
): { cities: PointType[]; centers: PointType[] } => {
  const getCenters = (
    numberOfCenters: number,
    cities: PointType[],
    centers: PointType[] = [],
  ): { cities: PointType[]; centers: PointType[] } => {
    if (centers.length === numberOfCenters) {
      return { cities, centers };
    }

    const newCenter = getCenter(cities, centers);
    return getCenters(numberOfCenters, removeItem(cities, newCenter), [...centers, newCenter]);
  };

  return getCenters(numberOfCenters, cities.slice(1), cities.slice(0, 1));
};

export const calculateRadius = (cities: PointType[], centers: PointType[]): number => {
  const helper = (cities: PointType[], centers: PointType[], maxDistance: number = 0): number =>
    cities.length
      ? helper(
          cities.slice(1),
          centers,
          Math.max(maxDistance, Math.min(...centers.map(c => calculateDistance(c, cities[0])))),
        )
      : maxDistance;
  return helper(cities, centers);
};
