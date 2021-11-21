import { AxisType, PointType } from 'types';

interface NodeProps {
  line?: { coordinate: number; axis: AxisType } | null;
  left?: Node | null;
  right?: Node | null;
  point?: PointType | null;
}

export type NodeAreaType = {
  minY: number;
  maxY: number;
  minX: number;
  maxX: number;
};

class Node {
  readonly line;
  readonly left;
  readonly right;
  readonly point;
  #nodeArea: NodeAreaType | null = null;

  constructor({ line = null, right = null, left = null, point = null }: NodeProps) {
    this.line = line;
    this.left = left;
    this.right = right;
    this.point = point;
  }
  #compareArea(firstArea: NodeAreaType | null, secondArea: NodeAreaType): NodeAreaType;
  #compareArea(firstArea: NodeAreaType, secondArea: NodeAreaType | null): NodeAreaType;
  #compareArea(firstArea: NodeAreaType | null, secondArea: NodeAreaType | null): NodeAreaType;
  #compareArea(firstArea: NodeAreaType, secondArea: NodeAreaType): NodeAreaType {
    if (!firstArea) return secondArea;
    if (!secondArea) return firstArea;
    return {
      maxX: firstArea.maxX < secondArea.maxX ? secondArea.maxX : firstArea.maxX,
      minX: firstArea.minX > secondArea.minX ? secondArea.minX : firstArea.minX,
      maxY: firstArea.maxY < secondArea.maxY ? secondArea.maxY : firstArea.maxY,
      minY: firstArea.minY > secondArea.minY ? secondArea.minY : firstArea.minY,
    };
  }

  get isLeaf(): boolean {
    return !(this.left || this.right);
  }

  get nodeArea(): NodeAreaType {
    if (this.#nodeArea) return this.#nodeArea;
    const tailRecHelper = (node: NodeType, nodeArea: NodeAreaType | null): NodeAreaType => {
      switch (true) {
        case node.isLeaf:
          const [x, y] = node.point!;
          return this.#compareArea(nodeArea, {
            maxX: x,
            minX: x,
            maxY: y,
            minY: y,
          });
        default:
          const leftArea = node.left && tailRecHelper(node.left, nodeArea);
          const rightArea = node.right && tailRecHelper(node.right, nodeArea);
          return this.#compareArea(leftArea, rightArea);
      }
    };
    this.#nodeArea = tailRecHelper(this, this.#nodeArea);
    return this.#nodeArea;
  }
}

export type NodeType = Node;

export const getNode = (props: NodeProps): NodeType => new Node(props);
