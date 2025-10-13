export interface BoardCell {
  id: number;
  name: string;
  type: 'start' | 'property' | 'card' | 'tax' | 'chance';
  price?: number;
  amount?: number;
  color: string | null;
}

export const BOARD_CELLS: BoardCell[] = [
  { id: 0, name: 'Start', type: 'start', color: null },
  {
    id: 1,
    name: 'Mediterranean Avenue',
    type: 'property',
    price: 60,
    color: 'purple',
  },
  { id: 2, name: 'Community Chest', type: 'card', color: 'blue' },
  {
    id: 3,
    name: 'Baltic Avenue',
    type: 'property',
    price: 60,
    color: 'purple',
  },
  { id: 4, name: 'Income Tax', type: 'tax', amount: 200, color: 'red' },
  {
    id: 5,
    name: 'Reading Railroad',
    type: 'property',
    price: 200,
    color: 'brown',
  },
  {
    id: 6,
    name: 'Oriental Avenue',
    type: 'property',
    price: 100,
    color: 'lightblue',
  },
  { id: 7, name: 'Chance', type: 'card', color: 'blue' },
  {
    id: 8,
    name: 'Vermont Avenue',
    type: 'property',
    price: 100,
    color: 'lightblue',
  },
  {
    id: 9,
    name: 'Connecticut Avenue',
    type: 'property',
    price: 120,
    color: 'lightblue',
  },
];
