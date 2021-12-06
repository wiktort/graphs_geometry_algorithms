export class Node {
  maxIndependentSetSize: number;
  value: number;
  children: Node[] = [];
  constructor(value: number) {
    this.maxIndependentSetSize = 0;
    this.value = value;
  }
}
