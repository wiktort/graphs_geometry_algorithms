import { Plot, plot } from 'nodeplotlib';

import { getX, getY } from '../helpers.ts';
import { PointType } from '../types';
import { testData } from './testData';

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
type KernelType = {
  kernelExists: boolean;
  kernelMinimum: PointType;
  kernelMaximum: PointType;
};

export class Polygon {
  //
  //Properties' types
  //
  #pointWithYMin: PointType;
  #pointWithYMax: PointType;
  #localMinimum: PointType[];
  #localMaximum: PointType[];
  #memoization: {
    kernel?: KernelType;
    kernelPerimeter?: number;
  } = {};

  //
  //Init
  //
  constructor(readonly points: PointType[]) {
    const { yMin, yMax } = this.#getPointsWithMaxAndMinY({ points, globalY: true });
    this.#pointWithYMin = yMin;
    this.#pointWithYMax = yMax;

    const { localMinimum, localMaximum } = this.#getLocalMinimumAndMaximum(points);
    this.#localMinimum = localMinimum;
    this.#localMaximum = localMaximum;
  }

  //
  // Methods
  //
  #getPointsWithMaxAndMinY = ({ points, globalY }: { points: PointType[]; globalY?: boolean }) => {
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

  #getNextIndex = (index: number, list: any[]) => (index === list.length - 1 ? 0 : index + 1);
  #getPrevoiusIndex = (index: number, list: any[]) => (index === 0 ? list.length : index) - 1;
  #checkNextSense = (index: number, points: PointType[]): 'up' | 'down' => {
    const currentPoint = points[index];
    const nextIndex = this.#getNextIndex(index, points);

    if (getY(currentPoint) > getY(points[nextIndex])) return 'down';
    else if (getY(currentPoint) < getY(points[nextIndex])) return 'up';
    //it will become a loop if a line is provided
    else return this.#checkNextSense(nextIndex, points);
  };

  #checkPreviousSense = (index: number, points: PointType[]): 'up' | 'down' => {
    const currentPoint = points[index];
    const prevoiusIndex = this.#getPrevoiusIndex(index, points);

    if (getY(currentPoint) > getY(points[prevoiusIndex])) return 'up';
    else if (getY(currentPoint) < getY(points[prevoiusIndex])) return 'down';
    //it will become a loop if a line is provided
    else return this.#checkPreviousSense(prevoiusIndex, points);
  };

  #getLocalMinimumAndMaximum = (points: PointType[]) =>
    points.reduce(
      (vertices, currentPoint, index) => {
        const prevoiusIndex = this.#getPrevoiusIndex(index, points);
        const nextIndex = this.#getNextIndex(index, points);
        const { turnDirection, vectorSense } = this.#getVertexData(
          points[prevoiusIndex],
          currentPoint,
          points[nextIndex],
        );

        if (turnDirection === 'right') {
          if (vectorSense !== 'none') {
            if (getY(currentPoint) > Math.max(getY(points[prevoiusIndex]), getY(points[nextIndex]))) {
              return {
                ...vertices,
                localMaximum: [...vertices.localMaximum, currentPoint],
              };
            } else if (getY(currentPoint) < Math.min(getY(points[prevoiusIndex]), getY(points[nextIndex]))) {
              return {
                ...vertices,
                localMinimum: [...vertices.localMinimum, currentPoint],
              };
            } else if (getY(currentPoint) === getY(points[nextIndex])) {
              const nextSense = this.#checkNextSense(nextIndex, points);
              if ((vectorSense === 'down' && nextSense === 'up') || (vectorSense === 'up' && nextSense === 'down')) {
                const extrema = vectorSense === 'down' && nextSense === 'up' ? 'localMinimum' : 'localMaximum';
                return {
                  ...vertices,
                  [extrema]: [...vertices[extrema], currentPoint],
                };
              }
            } else if (getY(currentPoint) === getY(points[prevoiusIndex])) {
              const previousSense = this.#checkPreviousSense(prevoiusIndex, points);
              if (
                (vectorSense === 'right' && previousSense === 'up') ||
                (vectorSense === 'left' && previousSense === 'down')
              ) {
                const extrema = vectorSense === 'right' && previousSense === 'up' ? 'localMaximum' : 'localMinimum';
                return {
                  ...vertices,
                  [extrema]: [...vertices[extrema], currentPoint],
                };
              }
            }
          }
        }

        return vertices;
      },
      { localMinimum: [], localMaximum: [] } as { localMinimum: PointType[]; localMaximum: PointType[] },
    );

  #calculateDistance = (pointA: PointType, pointB: PointType): number =>
    Math.sqrt(Math.pow(getX(pointB) - getX(pointA), 2) + Math.pow(getY(pointB) - getY(pointA), 2));

  #calculatePointLineDistance = ({
    linePointA,
    linePointB,
    point,
  }: {
    linePointA: PointType;
    linePointB: PointType;
    point: PointType;
  }): number => {
    const A = getY(linePointB) - getY(linePointA);
    const B = getX(linePointB) - getX(linePointA);
    return (
      Math.abs(A * (getX(linePointA) - getX(point)) + B * (getY(point) - getY(linePointA))) / Math.sqrt(A * A + B * B)
    );
  };

  #checkIfMinAndMaxAreNeighbours = (kernelMinimum: PointType, kernelMaximum: PointType) => {
    const kernelMinimumIndex = this.points.findIndex(
      ([x, y]) => x === getX(kernelMinimum) && y === getY(kernelMinimum),
    );
    const kernelMaximumIndex = this.points.findIndex(
      ([x, y]) => x === getX(kernelMaximum) && y === getY(kernelMaximum),
    );
    return Math.abs(kernelMaximumIndex - kernelMinimumIndex) === 1;
  };

  #calculatePerimeterOfARightSide= ({
    pointsOnTheSide,
    kernelMaximum,
    kernelMinimum,
  }: {
    pointsOnTheSide: PointType[];
    kernelMinimum: PointType;
    kernelMaximum: PointType;
  }): number => {
    //no points on the side
    if (pointsOnTheSide.length === 0) {
      const areMinAndMaxNeighbours = this.#checkIfMinAndMaxAreNeighbours(kernelMinimum, kernelMaximum);
    
      const fourthQuarterPoints = areMinAndMaxNeighbours
        ? [kernelMaximum]
        : this.points.filter((p) => getX(p) > getX(kernelMaximum) && getY(p) < getY(kernelMaximum));
      const firstQuarterPoints = areMinAndMaxNeighbours
        ? [kernelMinimum]
        : this.points.filter((p) => getX(p) > getX(kernelMinimum) && getY(p) > getY(kernelMinimum));
      const borderLinePointA = fourthQuarterPoints[fourthQuarterPoints.length - 1];
      const borderLinePointB = firstQuarterPoints[0];
      const distanceFromYMaxToBorder = this.#calculatePointLineDistance({
        linePointA: borderLinePointA || kernelMaximum,
        linePointB: borderLinePointB || kernelMinimum,
        point: kernelMaximum,
      });
      const distanceFromYMinToBorder = this.#calculatePointLineDistance({
        linePointA: borderLinePointA || kernelMaximum,
        linePointB: borderLinePointB || kernelMinimum,
        point: kernelMinimum,
      });
      const perimeterPointAOnBorder = [
        getX(kernelMaximum) + distanceFromYMaxToBorder,
        getY(kernelMaximum),
      ] as PointType;
      const perimeterPointBOnBorder = [
        getX(kernelMinimum) + distanceFromYMinToBorder,
        getY(kernelMinimum),
      ] as PointType;
      const lengthOfBorder = this.#calculateDistance(perimeterPointAOnBorder, perimeterPointBOnBorder);
      return lengthOfBorder + distanceFromYMaxToBorder + distanceFromYMinToBorder;
    }

    const sortedPoints = pointsOnTheSide.sort((p1, p2) => getY(p1) - getY(p2));

    const perimeter: number = sortedPoints.reduce((perimeter, currentPoint, index, array) => {
      const indexInMainList = this.points.findIndex(([x, y]) => x === getX(currentPoint) && y === getY(currentPoint));
      const getDistanceFromYMaxToBoder = () =>
        this.#calculatePointLineDistance({
          linePointA: this.points[this.#getPrevoiusIndex(indexInMainList, this.points)],
          linePointB: currentPoint,
          point: kernelMaximum,
        });
      const getDistanceFromYMinToBoder = () =>
        this.#calculatePointLineDistance({
          linePointA: this.points[this.#getNextIndex(indexInMainList, this.points)],
          linePointB: currentPoint,
          point: kernelMinimum,
        });
      const getDistanceFromPointToYMaxLine = (distanceFromYMaxToBoder: number) =>
        this.#calculatePointLineDistance({
          linePointA: kernelMaximum,
          linePointB: [
            getX(kernelMaximum) + distanceFromYMaxToBoder + 1,
            getY(kernelMaximum),
          ],
          point: currentPoint,
        });
      const getDistanceFromPointToYMinLine = (distanceFromYMinToBoder: number) =>
        this.#calculatePointLineDistance({
          linePointA: kernelMinimum,
          linePointB: [
            getX(kernelMinimum) + distanceFromYMinToBoder + 1,
            getY(kernelMinimum),
          ],
          point: currentPoint,
        });

      // only one point on the side
      if (index === 0 && index === sortedPoints.length - 1) {
        const distanceFromYMaxToBoder = getDistanceFromYMaxToBoder();
        const distanceFromYMinToBoder = getDistanceFromYMinToBoder();
        if (this.#pointWithYMin === kernelMinimum) {
          return (
            perimeter +
            distanceFromYMaxToBoder +
            getDistanceFromPointToYMaxLine(distanceFromYMaxToBoder) +
            this.#calculateDistance(kernelMinimum, currentPoint)
          );
        }
        return (
          perimeter +
          distanceFromYMaxToBoder +
          distanceFromYMinToBoder +
          getDistanceFromPointToYMaxLine(distanceFromYMaxToBoder) +
          getDistanceFromPointToYMinLine(distanceFromYMinToBoder)
        );
        // first point on the side
      } else if (index === 0) {
        if (getY(currentPoint) === getY(kernelMaximum)){
          return perimeter + this.#calculateDistance(kernelMaximum, currentPoint)
        } else {
            const distanceFromYMaxToBoder = getDistanceFromYMaxToBoder();
            return perimeter + distanceFromYMaxToBoder + getDistanceFromPointToYMaxLine(distanceFromYMaxToBoder);
        };
        // last point on the side
      } else if (index === sortedPoints.length - 1) {
        const distanceToPreviousPoint = this.#calculateDistance(sortedPoints[index - 1], currentPoint);
          if (getY(currentPoint) === getY(kernelMinimum)){
            return perimeter + this.#calculateDistance(kernelMinimum, currentPoint) + distanceToPreviousPoint;
          } else {
            const distanceFromYMinToBoder = getDistanceFromYMinToBoder();
            return (
              perimeter +
              distanceFromYMinToBoder +
              getDistanceFromPointToYMinLine(distanceFromYMinToBoder) +
              distanceToPreviousPoint
            );
          }
        // other points on the side
      } else {
        return perimeter + this.#calculateDistance(sortedPoints[index - 1], currentPoint);
      }
    }, 0);
    return perimeter;
  };

  #preparePointsOnLeftSide = (points: PointType[], kernelMaximum: PointType) => {
    if(points.some(p => getY(p) === getY(kernelMaximum))){
      const pointsOnLocalMaxYAxis = points.filter(p => getY(p) === getY(kernelMaximum));
      const otherPoints = points.filter(p => getY(p) !== getY(kernelMaximum)).sort((p1, p2) =>  getY(p2) - getY(p1));

      return [...otherPoints, ...pointsOnLocalMaxYAxis];

    };
    const sortedPoints = points.sort((p1, p2) =>  getY(p2) - getY(p1));
    return sortedPoints;
  };

  #calculatePerimeterOfALeftSide = ({
    pointsOnTheSide,
    kernelMaximum,
    kernelMinimum,
  }: {
    pointsOnTheSide: PointType[];
    kernelMinimum: PointType;
    kernelMaximum: PointType;
  }): number => {
    //no points on the side
    if (pointsOnTheSide.length === 0) {
      const areMinAndMaxNeighbours = this.#checkIfMinAndMaxAreNeighbours(kernelMinimum, kernelMaximum);

      const thirdQuarterPoints = areMinAndMaxNeighbours
        ? [kernelMaximum]
        : this.points.filter((p) => getX(p) < getX(kernelMaximum) && getY(p) < getY(kernelMaximum));
      const secondQuarterPoints = areMinAndMaxNeighbours
        ? [kernelMinimum]
        : this.points.filter((p) => getX(p) < getX(kernelMinimum) && getY(p) > getY(kernelMinimum));
      const borderLinePointA = secondQuarterPoints[secondQuarterPoints.length - 1] || kernelMinimum;
      const borderLinePointB = thirdQuarterPoints[0] || kernelMaximum;

      const distanceFromYMinToBorder = this.#calculatePointLineDistance({
        linePointA: borderLinePointA,
        linePointB: borderLinePointB,
        point: kernelMinimum,
      });
      const distanceFromYMaxToBorder = this.#calculatePointLineDistance({
        linePointA: borderLinePointA,
        linePointB: borderLinePointB,
        point: kernelMaximum,
      });
      const perimeterPointAOnBorder = [
        getX(kernelMinimum) - distanceFromYMaxToBorder,
        getY(kernelMinimum),
      ] as PointType;
      const perimeterPointBOnBorder = [
        getX(kernelMaximum) - distanceFromYMinToBorder,
        getY(kernelMaximum),
      ] as PointType;
      const lengthOfBorder = this.#calculateDistance(perimeterPointAOnBorder, perimeterPointBOnBorder);

      return lengthOfBorder + distanceFromYMaxToBorder + distanceFromYMinToBorder;
    };

    const sortedPoints = this.#preparePointsOnLeftSide(pointsOnTheSide, kernelMaximum);

    const perimeter: number = sortedPoints.reduce((perimeter, currentPoint, index) => {
      const indexInMainList = this.points.findIndex(([x, y]) => x === getX(currentPoint) && y === getY(currentPoint));
      const getDistanceFromYMaxToBoder = () =>
        this.#calculatePointLineDistance({
          linePointA: this.points[this.#getNextIndex(indexInMainList, this.points)],
          linePointB: currentPoint,
          point: kernelMaximum,
        });
      const getDistanceFromYMinToBoder = () =>
        this.#calculatePointLineDistance({
          linePointA: this.points[this.#getPrevoiusIndex(indexInMainList, this.points)],
          linePointB: currentPoint,
          point: kernelMinimum,
        });
      const getDistanceFromPointToYMaxLine = (distanceFromYMaxToBoder: number) =>
        this.#calculatePointLineDistance({
          linePointA: kernelMaximum,
          linePointB: [
            getX(kernelMaximum) - distanceFromYMaxToBoder - 1,
            getY(kernelMaximum),
          ],
          point: currentPoint,
        });
      const getDistanceFromPointToYMinLine = (distanceFromYMinToBoder: number) =>
        this.#calculatePointLineDistance({
          linePointA: kernelMinimum,
          linePointB: [
            getX(kernelMinimum) - distanceFromYMinToBoder - 1,
            getY(kernelMinimum),
          ],
          point: currentPoint,
        });

      // only one point on the side
      if (index === 0 && index === sortedPoints.length - 1) {
        const distanceFromYMaxToBoder = getDistanceFromYMaxToBoder();
        const distanceFromYMinToBoder = getDistanceFromYMinToBoder();
        if (this.#pointWithYMin === kernelMinimum) {
          return (
            perimeter +
            distanceFromYMaxToBoder +
            getDistanceFromPointToYMaxLine(distanceFromYMaxToBoder) +
            this.#calculateDistance(kernelMinimum, currentPoint)
          );
        }
        return (
          perimeter +
          distanceFromYMaxToBoder +
          distanceFromYMinToBoder +
          getDistanceFromPointToYMaxLine(distanceFromYMaxToBoder) +
          getDistanceFromPointToYMinLine(distanceFromYMinToBoder)
        );
      // first point on the side
      }else if (index === 0) {
        if (getY(currentPoint) === getY(kernelMinimum))
          return perimeter + this.#calculateDistance(kernelMinimum, currentPoint);
        else {
            const distanceFromYMinToBoder = getDistanceFromYMinToBoder();
            return perimeter + distanceFromYMinToBoder + getDistanceFromPointToYMinLine(distanceFromYMinToBoder);
          }
      // last point on the side
      } else if (index === sortedPoints.length - 1) {
          const distanceToPreviousPoint = this.#calculateDistance(sortedPoints[index - 1], currentPoint);
          if (getY(currentPoint) === getY(kernelMaximum)){
            return perimeter + this.#calculateDistance(kernelMaximum, currentPoint) + distanceToPreviousPoint;
          }
          else {
            const distanceFromYMaxToBoder = getDistanceFromYMaxToBoder();
            return (
              perimeter +
              distanceFromYMaxToBoder +
              getDistanceFromPointToYMaxLine(distanceFromYMaxToBoder) +
              distanceToPreviousPoint
            );
        }
     // other points on the side
      } else {
        if(
            getY(currentPoint) === getY(kernelMaximum) 
            && getY(sortedPoints[index - 1]) === getY(kernelMinimum)
        ) {
          const yDiff = getY(sortedPoints[index - 1]) - getY(currentPoint);
          const xDiff = getX(currentPoint) - getX(sortedPoints[index - 1])
          return perimeter + yDiff + xDiff;
        };

        return perimeter + this.#calculateDistance(sortedPoints[index - 1], currentPoint);
      }
    }, 0);
    return perimeter;
  };

  drawPolygon = () => {
    const data: Plot[] = [
      {
        x: this.points.map((p) => getX(p)).concat(getX(this.points[0])),
        y: this.points.map((p) => getY(p)).concat(getY(this.points[0])),
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

  get kernel() {
    if (this.#memoization.kernel === undefined) {
      const kernelMaximum = this.#getPointsWithMaxAndMinY({ points: this.#localMaximum }).yMax || this.#pointWithYMax;
      const kernelMinimum = this.#getPointsWithMaxAndMinY({ points: this.#localMinimum }).yMin || this.#pointWithYMin;

      this.#memoization.kernel = {
        kernelExists: getY(kernelMinimum) >= getY(kernelMaximum),
        kernelMinimum,
        kernelMaximum,
      };
    }
    return this.#memoization.kernel;
  }

  get kernelPerimeter() {
    if (!this.kernel.kernelExists) {
      console.log("Kernel doesn't exist");
      return null;
    }

    if (this.#memoization.kernelPerimeter === undefined) {
      const { kernelMaximum, kernelMinimum } = this.kernel;

      const pointsWithinKernel = this.points.filter(
        (point) =>
          getY(point) >= getY(kernelMaximum) &&
          getY(point) <= getY(kernelMinimum) &&
          getX(point) !== getX(kernelMaximum) &&
          getX(point) !== getX(kernelMinimum),
      );

      const pointsOnTheLeftSide = pointsWithinKernel.filter((point) => getX(point) < getX(kernelMaximum));
      const pointsOnTheRightSide = pointsWithinKernel.filter((point) => getX(point) > getX(kernelMaximum));

      const perimeterOfTheLeftSide = this.#calculatePerimeterOfALeftSide({
        pointsOnTheSide: pointsOnTheLeftSide,
        kernelMinimum,
        kernelMaximum,
      });
      const perimeterOfTheRightSide = this.#calculatePerimeterOfARightSide({
        pointsOnTheSide: pointsOnTheRightSide,
        kernelMinimum,
        kernelMaximum,
      });

      this.#memoization.kernelPerimeter = perimeterOfTheLeftSide + perimeterOfTheRightSide;
    }
    return this.#memoization.kernelPerimeter;
  }
}

const polygon = new Polygon(testData[11]);
const kernelExists = polygon.kernel.kernelExists;
console.log(`
Kernel exists: ${kernelExists}
yMin | localMin: [${polygon.kernel.kernelMinimum}]
yMax | localMax: [${polygon.kernel.kernelMaximum}]
Perimeter of the kernel: ${polygon.kernelPerimeter}
`);
polygon.drawPolygon();
