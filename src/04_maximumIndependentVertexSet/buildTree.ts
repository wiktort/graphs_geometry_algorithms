import { Node } from './Node';
import { TreeType } from './types';

export const buildTree = (data: TreeType): Node => {
  const vertex = new Node(data.value);
  vertex.children = data.children.map(buildTree);
  return vertex;
};
