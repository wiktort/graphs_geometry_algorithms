import { TreeType } from './types';

export const printTree = (tree: TreeType, level = 0) => {
  console.log('   '.repeat(level) + '`---' + tree.value);
  tree.children?.forEach((child) => printTree(child, level + 1));
};
