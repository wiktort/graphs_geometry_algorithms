import { buildTree } from './buildTree';
import { getMaximumIndependentSet } from './getMaximumIndependentSet';
import { printTree } from './printData';
import { testData } from './testData';

const init = () => {
  const tree = buildTree(testData[3]);
  const mis = getMaximumIndependentSet(tree);

  console.log(`Maximum Independent Vertex Set Size: ${mis.maximumIndependentSetSize}`);
  console.log(`Maximum Independent Vertex Set: ${Array.from(mis.maximumIndependentSet).map((i) => i.value)}`);
  printTree(tree);
};
init();
