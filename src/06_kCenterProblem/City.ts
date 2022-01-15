import { PointType } from 'types';

export class City {
  optimizedDistance: number | undefined;
  constructor(readonly coordinates: PointType) {}
}
