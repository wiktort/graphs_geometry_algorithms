import { PointType } from 'types';

import { City } from './City';
import { drawData } from './drawData';
import { calculateRadius, furthestFirst } from './findCenters';
import {
  calculateRadius as calculateRadiusWDO,
  furthestFirst as furthestFirstWDO,
} from './findCentersWithDistanceOptimization';
import { testData } from './testData';
import { usageTester } from './usageTester';

const logOutput = (centers: PointType[], radius: number) =>
  console.log(centers.map((c, index) => `Center nr ${index + 1}: ${c}`).join('\n'), `\nRadius: ${radius}`);

const getOutput = (
  numberOfCenters: number,
  cities: PointType[],
  distanceOptimization?: boolean,
): {
  centers: PointType[];
  cities: PointType[];
  radius: number;
} => {
  if (distanceOptimization) {
    const { centers, cities: newCities } = furthestFirstWDO(
      numberOfCenters,
      cities.map(c => new City(c)),
    );
    return {
      centers: centers.map(c => c.coordinates),
      cities: newCities.map(c => c.coordinates),
      radius: calculateRadiusWDO(newCities, centers),
    };
  } else {
    const { centers, cities: newCities } = furthestFirst(numberOfCenters, cities);
    return {
      centers,
      cities,
      radius: calculateRadius(newCities, centers),
    };
  }
};

const init = (numberOfCenters: number, dataIndex: number, distanceOptimization?: boolean, testUsage?: boolean) => {
  const cities = testData[dataIndex];
  if (cities.length < numberOfCenters) throw new Error('Number of centers has to bigger');
  if (cities.length === numberOfCenters) {
    logOutput(cities, 0.0);
    return;
  }

  const { centers, cities: newCities, radius } = getOutput(numberOfCenters, cities, distanceOptimization);

  if (testUsage) {
    usageTester(numberOfCenters, cities.length);
  } else {
    logOutput(centers, radius);
    drawData(newCities, centers, radius);
  }
};

init(5, 2);
