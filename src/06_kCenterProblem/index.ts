import { PointType } from 'types';

import { drawData } from './drawData';
import { calculateRadius, furthestFirst } from './findCenters';
import { testData } from './testData';

const logOutput = (centers: PointType[], radius: number) =>
  console.log(centers.map((c, index) => `Center nr ${index + 1}: ${c}`).join('\n'), `\nRadius: ${radius}`);

const init = (numberOfCenters: number, dataIndex: number) => {
  const cities = testData[dataIndex];
  if (cities.length < numberOfCenters) throw new Error('Number of centers has to bigger');
  if (cities.length === numberOfCenters) {
    logOutput(cities, 0.0);
  }

  const { centers, cities: newCities } = furthestFirst(numberOfCenters, cities);
  const radius = calculateRadius(newCities, centers);

  logOutput(centers, radius);
  drawData(newCities, centers, radius);
};

init(5, 2);
