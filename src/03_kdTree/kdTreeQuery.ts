import { PointType } from 'types';

import { getX, getY } from '../helpers';
import { AreaType } from './getArea';
import { NodeAreaType, NodeType } from './getNode';

interface SearchTreeProps {
  tree: NodeType;
  area: AreaType;
}

const checkLeaf = (leaf: NodeType, area: AreaType): Boolean => {
  if (!leaf.point) {
    throw new Error('Leaf must have the point property');
  }
  return area.isInside(leaf.point);
};

const reportSubtree = (tree: NodeType): PointType[] => {
  const tailRecHelper = (tree: NodeType, points: PointType[] = []): PointType[] => {
    if (tree.isLeaf && !tree.point) {
      throw new Error('Leaf must have a point property');
    }
    if (tree.isLeaf) {
      return [...points, tree.point!];
    }
    const pointsOnLeft = tree.left && tailRecHelper(tree.left, points);
    const pointsOnRight = tree.right && tailRecHelper(tree.right, points);
    return [...(pointsOnLeft || []), ...(pointsOnRight || [])];
  };
  return tailRecHelper(tree);
};

const isFullyIncluded = (area: AreaType, treeArea: NodeAreaType): Boolean => {
  if (
    treeArea.minX >= getX(area.pMin) &&
    treeArea.maxX <= getX(area.pMax) &&
    treeArea.minY >= getY(area.pMin) &&
    treeArea.maxY <= getY(area.pMax)
  ) {
    return true;
  }
  return false;
};

export const kdTreeQuery = ({ tree, area }: SearchTreeProps): PointType[] => {
  const tailRecHelper = (tree: NodeType, includedPoints: PointType[] = []): PointType[] => {
    switch (true) {
      case tree.isLeaf:
        return checkLeaf(tree, area) ? includedPoints.concat(tree.point!) : includedPoints;
      default:
        const pointsOnLeft =
          tree.left &&
          (isFullyIncluded(area, tree.left.nodeArea)
            ? reportSubtree(tree.left)
            : tailRecHelper(tree.left, includedPoints));
        const pointsOnRight =
          tree.right &&
          (isFullyIncluded(area, tree.right.nodeArea)
            ? reportSubtree(tree.right)
            : tailRecHelper(tree.right, includedPoints));
        return [...includedPoints, ...(pointsOnLeft || []), ...(pointsOnRight || [])];
    }
  };
  return tailRecHelper(tree);
};
