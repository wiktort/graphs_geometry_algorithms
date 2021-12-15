import { PointType } from 'types';

export type LineType = [PointType, PointType];
export interface LinePointType {
  point: PointType;
  lineId: string;
  orientation: 'horizontal' | 'vertical';
  pointType: 'start' | 'end';
}
