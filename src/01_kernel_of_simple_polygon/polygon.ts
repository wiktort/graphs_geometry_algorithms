import { Plot, plot } from 'nodeplotlib';

import { testData } from './testData';
import { PointType } from './types';

/*
Assumptions
1. Array with points is ordered in a way that an each next point is a next vertix of the polygon (moving anticlockwise)
2. We do not consider points that have the same coordinates
*/

type TurnDirectionType = 'right' | 'left' | 'collinear';
type VectorSenseType = 'up' | 'down' | 'left' | 'right' | 'none';
type VertexDataType = {
  vectorSense: VectorSenseType;
  turnDirection: TurnDirectionType;
};

export class Polygon {
  //
  //Properties' types
  //
  #pointWithYMin: PointType;
  #pointWithYMax: PointType;
  #localMinimum: PointType[];
  #localMaximum: PointType[];
  #kernelExists: boolean | undefined;
  #kernelPerimeter: number | undefined;

  //
  //Init
  //
  constructor(readonly points: PointType[]) {
    const { yMin, yMax } = this.#getMaxAndMinY({ points, globalY: true });
    this.#pointWithYMin = yMin;
    this.#pointWithYMax = yMax;

    const { localMinimum, localMaximum } = this.#getLocalMinimumAndMaximum(points);
    this.#localMinimum = localMinimum;
    this.#localMaximum = localMaximum;
  }

  //
  // Methods
  //
  #getMaxAndMinY = ({ points, globalY }: { points: PointType[]; globalY?: boolean }) => {
    const sortedPoints = [...points].sort((p1, p2) => p1[1] - p2[1]);
    return {
      yMin: globalY ? sortedPoints[points.length - 1] : sortedPoints[0],
      yMax: globalY ? sortedPoints[0] : sortedPoints[points.length - 1],
    };
  };

  #getVertexData = (pointA: PointType, pointB: PointType, pointC: PointType): VertexDataType => {
    const vectorA = [pointB[0] - pointA[0], pointB[1] - pointA[1]];
    const vectorB = [pointC[0] - pointB[0], pointC[1] - pointB[1]];

    const vectorSense: VectorSenseType =
      vectorA[1] > 0 ? 'up' : vectorA[1] < 0 ? 'down' : vectorA[0] > 0 ? 'right' : vectorA[0] < 0 ? 'left' : 'none';

    const vectorProduct = vectorA[0] * vectorB[1] - vectorB[0] * vectorA[1];

    return {
      vectorSense,
      turnDirection: vectorProduct > 0 ? 'left' : vectorProduct < 0 ? 'right' : 'collinear',
    };
  };

  #getLocalMinimumAndMaximum = (points: PointType[]) =>
    points.reduce(
      (vertices, currentPoint, index) => {
        const prevoiusIndex = (index === 0 ? points.length : index) - 1;
        const nextIndex = index === points.length - 1 ? 0 : index + 1;
        const { turnDirection, vectorSense } = this.#getVertexData(
          points[prevoiusIndex],
          currentPoint,
          points[nextIndex],
        );

        const extrema = ['up', 'right'].includes(vectorSense) ? 'localMaximum' : 'localMinimum';

        if (turnDirection === 'right') {
          if (currentPoint[1] > Math.min(points[prevoiusIndex][1], points[nextIndex][1]))
            if (vectorSense !== 'none')
              return {
                ...vertices,
                [extrema]: [...vertices[extrema], currentPoint],
              };
            else return vertices;
          // TODO - is there any local maximum that fulfills following assumption?
          // current y < min(prevoius y, next y)
          else
            return {
              ...vertices,
              localMinimum: [...vertices.localMinimum, currentPoint],
            };
        } else return vertices;
      },
      { localMinimum: [], localMaximum: [] } as { localMinimum: PointType[] | []; localMaximum: PointType[] | [] },
    );

  #calculateDistance = (pointA: PointType, pointB: PointType): number =>
    Math.sqrt(Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2));

  #calculatePointLineDistance = ({
    linePointA,
    linePointB,
    point,
  }: {
    linePointA: PointType;
    linePointB: PointType;
    point: PointType;
  }): number => {
    const A = linePointB[1] - linePointA[1];
    const B = linePointB[0] - linePointA[0];
    return Math.abs(A * (linePointA[0] - point[0]) + B * (point[1] - linePointA[1])) / Math.sqrt(A * A + B * B);
  };

  #calculatePerimeterOfASide = ({
    pointsOnTheSide,
    pointWithYMax,
    pointWithYMin,
  }: {
    pointsOnTheSide: PointType[];
    pointWithYMin: PointType;
    pointWithYMax: PointType;
  }): number => {
    const sortedPoints = pointsOnTheSide.sort((p1, p2) => p1[1] - p2[1]);

    //TODO - add case for 0 points on the side

    const perimeter: number = sortedPoints.reduce((perimeter, currentPoint, index) => {
      // only one point on the side
      if (index === 0 && index === sortedPoints.length - 1) {
        const indexInMainList = this.points.indexOf(currentPoint);
        const pointWithYMaxLineDistance = this.#calculatePointLineDistance({
          linePointA: this.points[indexInMainList - 1],
          linePointB: currentPoint,
          point: pointWithYMax,
        });
        const pointWithYMinLineDistance = this.#calculatePointLineDistance({
          linePointA: this.points[indexInMainList + 1],
          linePointB: currentPoint,
          point: pointWithYMin,
        });
        const pointLineDistance1 = this.#calculatePointLineDistance({
          linePointA: pointWithYMax,
          linePointB: [pointWithYMax[0] + pointWithYMaxLineDistance + 1, pointWithYMax[1]],
          point: currentPoint,
        });
        const pointLineDistance2 = this.#calculatePointLineDistance({
          linePointA: pointWithYMin,
          linePointB: [pointWithYMin[0] + pointWithYMinLineDistance + 1, pointWithYMin[1]],
          point: currentPoint,
        });
        return (
          perimeter + pointWithYMaxLineDistance + pointWithYMinLineDistance + pointLineDistance1 + pointLineDistance2
        );
        // last point on the side
      } else if (index === sortedPoints.length - 1) {
        if (currentPoint[1] === pointWithYMin[1])
          return perimeter + this.#calculateDistance(pointWithYMin, currentPoint);
        else {
          const indexInMainList = this.points.indexOf(currentPoint);
          const pointWithYMinLineDistance = this.#calculatePointLineDistance({
            linePointA: this.points[indexInMainList + 1],
            linePointB: currentPoint,
            point: pointWithYMin,
          });
          const pointLineDistance = this.#calculatePointLineDistance({
            linePointA: pointWithYMin,
            linePointB: [pointWithYMin[0] + pointWithYMinLineDistance + 1, pointWithYMin[1]],
            point: currentPoint,
          });
          return perimeter + pointWithYMinLineDistance + pointLineDistance;
        }
        // first point on the side
      } else if (index === 0) {
        if (currentPoint[1] === pointWithYMax[1])
          return perimeter + this.#calculateDistance(pointWithYMax, currentPoint);
        else {
          const indexInMainList = this.points.indexOf(currentPoint);
          const pointWithYMaxLineDistance = this.#calculatePointLineDistance({
            linePointA: this.points[indexInMainList - 1],
            linePointB: currentPoint,
            point: pointWithYMax,
          });
          const pointLineDistance = this.#calculatePointLineDistance({
            linePointA: pointWithYMax,
            linePointB: [pointWithYMax[0] + pointWithYMaxLineDistance + 1, pointWithYMax[1]],
            point: currentPoint,
          });
          return perimeter + pointWithYMaxLineDistance + pointLineDistance;
        }
        // other points on the side
      } else {
        return perimeter + this.#calculateDistance(sortedPoints[index - 1], currentPoint);
      }
    }, 0);
    return perimeter;
  };

  drawPolygon = () => {
    const data: Plot[] = [
      {
        x: this.points.map((p) => p[0]).concat(this.points[0][0]),
        y: this.points.map((p) => p[1]).concat(this.points[0][1]),
        type: 'scatter',
      },
    ];
    plot(data, {
      height: 1000,
    });
  };

  //
  //Getters
  //

  get kernelExists() {
    if (this.#kernelExists === undefined) {
      const pointWithYMax = this.#getMaxAndMinY({ points: this.#localMaximum }).yMax || this.#pointWithYMax;
      const pointWithYMin = this.#getMaxAndMinY({ points: this.#localMinimum }).yMin || this.#pointWithYMin;
      this.#kernelExists = pointWithYMin[1] >= pointWithYMax[1];
    }
    return this.#kernelExists;
  }

  get kernelPerimeter() {
    if (!this.kernelExists) {
      console.log("Kernel doesn't exist");
      return null;
    }

    if (this.#kernelPerimeter === undefined) {
      const pointWithYMax = this.#getMaxAndMinY({ points: this.#localMaximum }).yMax || this.#pointWithYMax;
      const pointWithYMin = this.#getMaxAndMinY({ points: this.#localMinimum }).yMin || this.#pointWithYMin;

      const pointsWithinKernel = this.points.filter(
        (point) =>
          point[1] >= pointWithYMax[1] &&
          point[1] <= pointWithYMin[1] &&
          point[0] !== pointWithYMax[0] &&
          point[0] !== pointWithYMin[0],
      );

      const pointsOnTheLeftSide = pointsWithinKernel.filter((point) => point[0] < pointWithYMax[0]);
      const pointsOnTheRightSide = pointsWithinKernel.filter((point) => point[0] > pointWithYMax[0]);

      const perimeterOfTheLeftSide = this.#calculatePerimeterOfASide({
        pointsOnTheSide: pointsOnTheLeftSide,
        pointWithYMin,
        pointWithYMax,
      });
      const perimeterOfTheRightSide = this.#calculatePerimeterOfASide({
        pointsOnTheSide: pointsOnTheRightSide,
        pointWithYMin,
        pointWithYMax,
      });

      this.#kernelPerimeter = perimeterOfTheLeftSide + perimeterOfTheRightSide;
    }
    return this.#kernelPerimeter;
  }
}

const polygon = new Polygon(testData[10]);
console.log(polygon.kernelPerimeter);
polygon.drawPolygon();
