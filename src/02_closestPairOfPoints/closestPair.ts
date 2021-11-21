import { plot, Plot } from 'nodeplotlib';
import { PointType } from 'types';

import { calculateDistance, getX, getY, sortPoints } from '../helpers';
import { testData } from './testData';

interface HalfsType {
    leftHalf: PointType[];
    rightHalf: PointType[];
    middleX: number;
    sortedPoints: PointType[];
};

interface ClosestPairType {
    closestPair: [PointType, PointType] | undefined;
    closestDistance: number | undefined;
}

const getSortedHalfs = (points: PointType[]): HalfsType => {
    const sortedPoints = sortPoints({points, axis: 'X'});
    const middleIndex = Math.round(sortedPoints.length / 2);
    const middleX = getX(sortedPoints[middleIndex]);
    return {
        leftHalf: sortedPoints.slice(0, middleIndex),
        rightHalf: sortedPoints.slice(middleIndex + 1, sortedPoints.length),
        middleX,
        sortedPoints
    };
};

const getClosestPair = (points: PointType[]): ClosestPairType=> {
    const helper = (
        points: PointType[], 
        currentClosestPair?: [PointType, PointType], 
        currentClosestDistance?: number
    ): ClosestPairType=> {
        let localClosestPair: [PointType, PointType] | undefined;
        let localClosestDistance: number | undefined;

        if(points.length < 2) return {closestPair: currentClosestPair, closestDistance: currentClosestDistance};

        for (let i = 1; i < points.length; i++){
            const distance = calculateDistance(points[0], points[i]);
            if (!localClosestDistance  || distance < localClosestDistance){
                localClosestPair = [points[0], points[i]];
                localClosestDistance = distance;
            };
        };

        if(!currentClosestDistance || (localClosestDistance && localClosestDistance < currentClosestDistance)) {
            return helper(points.slice(1), localClosestPair, localClosestDistance);
        } else {
            return helper(points.slice(1), currentClosestPair, currentClosestDistance);
        };
    };
    return helper(points);
};

const comparePoints = (leftPair: ClosestPairType, rightPair: ClosestPairType): ClosestPairType => {
    if(!leftPair.closestDistance || !rightPair.closestDistance) return leftPair.closestPair ? leftPair : rightPair;
    return leftPair.closestDistance < rightPair.closestDistance ? leftPair : rightPair;
};

export const drawPoints = (points: PointType[], closestPair: ClosestPairType) => {
    if(!closestPair.closestPair) return;
    const data: Plot[] = [
      {
        x: points.map((p) => getX(p)).concat(getX(points[0])),
        y: points.map((p) => getY(p)).concat(getY(points[0])),
        mode: 'markers',
        type: 'scatter',
      },
      {
          x: [getX(closestPair.closestPair[0]), getX(closestPair.closestPair[1])],
          y: [getY(closestPair.closestPair[0]), getY(closestPair.closestPair[1])],
          type: 'scatter'
      }
    ];
    plot(data, {
      width: 1000,
    });
  };


export const getClosestPairInSet = (points: PointType[]): ClosestPairType | null => {
    const {leftHalf,rightHalf, middleX, sortedPoints} = getSortedHalfs(points);
    const closestPairOnSides = comparePoints(getClosestPair(leftHalf), getClosestPair(rightHalf));
    const {closestDistance} = closestPairOnSides;
    if(!closestDistance){
        console.log("Sorry, I cannot find closest pair for an empty array ;)");
        return null;
    };
    const pointsInTheMiddle = sortedPoints
        .filter(p=> (getX(p) > middleX - closestDistance) &&  (getX(p) < middleX + closestDistance));

    return comparePoints(closestPairOnSides,  getClosestPair(pointsInTheMiddle));
};

const initFunction = (points: PointType[]) => {
    const closestPair = getClosestPairInSet(points);
    if(!closestPair) return;
    drawPoints(points, closestPair);
    console.log(closestPair);
};

initFunction(testData[18]);
