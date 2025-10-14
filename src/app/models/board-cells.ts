export interface BoardCell {
  id: number;
  boardId: number;
  name: string;
  type: 'start' | 'property' | 'special' | 'punishment' | 'rest';
  price?: number;
  amount?: number;
  color: string | null;
}
