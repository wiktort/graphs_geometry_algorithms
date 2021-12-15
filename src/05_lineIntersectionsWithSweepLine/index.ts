import { drawData } from './drawData';
import { getIntersections } from './getIntersections';
import { prepareSet } from './helpers';
import { testData } from './testData';

const init = (testCase: number) => {
  const lines = testData[testCase];
  const linePoints = prepareSet(lines);
  const intersections = getIntersections(linePoints);
  drawData(lines, intersections);
};

init(3);
