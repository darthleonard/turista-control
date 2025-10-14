import { Injectable } from '@angular/core';
import { BoardCell } from '../models';
import { localDatabase } from '../database/local-database';

@Injectable({ providedIn: 'root' })
export class BoardService {
  constructor() {}

  async getBoardCells(boardId: number): Promise<BoardCell[]> {
    return await localDatabase.boardCells
      .where('boardId')
      .equals(boardId)
      .toArray();
  }
}
