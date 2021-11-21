import { PointType } from 'types';

import { getX, getY } from '../helpers';

class Area {
  constructor(readonly pMin: PointType, readonly pMax: PointType) {
    if (getX(pMin) > getX(pMax) || getY(pMin) > getY(pMax)) {
      throw new Error("pMin's coordinates must be smaller than pMax's coordinates");
    }
  }

  isInside(point: PointType): Boolean {
    if (
      getX(point) >= getX(this.pMin) &&
      getX(point) <= getX(this.pMax) &&
      getY(point) >= getY(this.pMin) &&
      getY(point) <= getY(this.pMax)
    ) {
      return true;
    } else {
      return false;
    }
  }
}
export type AreaType = Area;
export interface AreaProps {
  pMin: PointType;
  pMax: PointType;
}
export const getArea = ({ pMin, pMax }: AreaProps): AreaType => new Area(pMin, pMax);
