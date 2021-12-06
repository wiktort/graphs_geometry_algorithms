import { TreeType } from './types';

export const testData: Record<number, TreeType> = {
  1: {
    value: 50,
    children: [
      {
        value: 30,
        children: [
          {
            value: 15,
            children: [
              {
                value: 9,
                children: [],
              },
              {
                value: 8,
                children: [{ value: 4, children: [] }],
              },
            ],
          },
          {
            value: 12,
            children: [
              {
                value: 10,
                children: [
                  { value: 2, children: [] },
                  { value: 7, children: [] },
                  { value: 9, children: [] },
                ],
              },
              {
                value: 6,
                children: [
                  { value: 2, children: [] },
                  { value: 4, children: [] },
                  { value: 5, children: [] },
                ],
              },
            ],
          },
        ],
      },
      {
        value: 20,
        children: [
          {
            value: 7,
            children: [
              { value: 1, children: [] },
              { value: 2, children: [] },
              { value: 5, children: [] },
              { value: 6, children: [] },
            ],
          },
        ],
      },
    ],
  },
  2: {
    value: 20,
    children: [
      {
        value: 8,
        children: [
          {
            value: 4,
            children: [],
          },
          {
            value: 12,
            children: [
              { value: 10, children: [] },
              { value: 14, children: [] },
            ],
          },
        ],
      },
      { value: 22, children: [{ value: 25, children: [] }] },
    ],
  },
  3: {
    value: 14,
    children: [
      {
        value: 5,
        children: [
          {
            value: 3,
            children: [
              {
                value: 2,
                children: [
                  { value: 1, children: [] },
                  { value: 1, children: [] },
                ],
              },
              {
                value: 1,
                children: [],
              },
            ],
          },
          { value: 1, children: [{ value: 1, children: [] }] },
        ],
      },
      {
        value: 9,
        children: [
          {
            value: 2,
            children: [
              { value: 1, children: [{ value: 1, children: [] }] },
              { value: 1, children: [] },
            ],
          },
          {
            value: 3,
            children: [
              {
                value: 2,
                children: [
                  { value: 1, children: [] },
                  { value: 1, children: [] },
                ],
              },
            ],
          },
          {
            value: 4,
            children: [
              { value: 1, children: [{ value: 1, children: [] }] },
              {
                value: 2,
                children: [
                  { value: 1, children: [] },
                  { value: 1, children: [] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
