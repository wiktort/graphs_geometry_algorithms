import express from 'express';

import { drawData } from '../helpers';
import { buildKdTree } from './buildKdTree';
import { getArea } from './getArea';
import { kdTreeQuery } from './kdTreeQuery';
import { testData } from './testData';

const app = express();

app.listen(5000, () => {
  console.log('listening on port 5000...');
});

const init = (): void => {
  const data = testData[2];
  const tree = buildKdTree(data.points);
  if (!tree) return;

  const area = getArea(data.area);

  const includedPoints = kdTreeQuery({ tree, area });
  app.get('/', (req, res) => {
    res.send({ tree, includedPoints });
  });
  drawData(data.points, area, includedPoints);
};

init();
