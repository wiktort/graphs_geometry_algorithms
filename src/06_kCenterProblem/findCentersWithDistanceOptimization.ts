import { calculateDistance, isNumber, removeItem } from '../helpers';
import { City } from './City';

const getCenter = (cities: City[], centers: City[], nextCenter?: City, maxDistance: number = 0): City => {
  if (!cities.length) {
    return nextCenter!;
  }

  const city = cities[0];
  const currentDistance = calculateDistance(centers.slice(-1)[0].coordinates, city.coordinates);
  city.optimizedDistance = isNumber(city.optimizedDistance)
    ? Math.min(city.optimizedDistance, currentDistance)
    : currentDistance;
  return getCenter(
    cities.slice(1),
    centers,
    city.optimizedDistance > maxDistance ? city : nextCenter,
    Math.max(city.optimizedDistance, maxDistance),
  );
};

export const furthestFirst = (numberOfCenters: number, cities: City[]): { cities: City[]; centers: City[] } => {
  const getCenters = (
    numberOfCenters: number,
    cities: City[],
    centers: City[] = [],
  ): { cities: City[]; centers: City[] } => {
    if (centers.length === numberOfCenters) {
      return { cities, centers };
    }

    const newCenter = getCenter(cities, centers);
    return getCenters(numberOfCenters, removeItem(cities, newCenter), [...centers, newCenter]);
  };

  return getCenters(numberOfCenters, cities.slice(1), cities.slice(0, 1));
};

export const calculateRadius = (cities: City[], centers: City[]): number => {
  const helper = (cities: City[], centers: City[], maxDistance: number = 0): number =>
    cities.length ? helper(cities.slice(1), centers, Math.max(maxDistance, cities[0].optimizedDistance!)) : maxDistance;
  return helper(cities, centers);
};
