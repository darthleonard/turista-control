import { Pipe, PipeTransform } from '@angular/core';
import { BoardCell } from '../models/board-cells';

@Pipe({
  name: 'boardCellName',
  pure: true,
})
export class BoardCellNamePipe implements PipeTransform {
  transform(position: number, boardCells: BoardCell[]): string {
    const cell = boardCells.find((c) => c.id === position);
    return cell ? cell.name : String(position);
  }
}
