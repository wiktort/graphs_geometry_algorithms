import { Node } from './Node';

interface MaximumIndependentSetType {
  maximumIndependentSetSize: number;
  maximumIndependentSet: Set<Node>;
}

export const getMaximumIndependentSet = (node: Node): MaximumIndependentSetType => {
  const maximumIndependentSet: Set<Node> = new Set();
  const helper = (node: Node): number => {
    if (node.maxIndependentSetSize !== 0) return node.maxIndependentSetSize;
    if (node.children.length === 0) {
      maximumIndependentSet.add(node);
      return 1;
    }

    // exclude the current node
    const misExcluded = node.children.reduce((mis, child) => mis + helper(child), 0);

    // include the current node
    const misIncluded = node.children.reduce(
      (mis, child) => mis + child.children.reduce((mis, grandChild) => mis + helper(grandChild), 0),
      1,
    );
    if (misIncluded > misExcluded) maximumIndependentSet.add(node);
    return (node.maxIndependentSetSize = Math.max(misExcluded, misIncluded));
  };
  return {
    maximumIndependentSetSize: helper(node),
    maximumIndependentSet,
  };
};
