import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { BOARD_CELLS, BoardCell } from 'src/app/models/board-cells';
import { TurnDetail } from 'src/app/models/turn-detail';
import { PositionSelectorComponent } from '../position-selector/position-selector.component';

@Component({
  selector: 'app-player-actions',
  templateUrl: './player-actions.component.html',
  styleUrls: ['./player-actions.component.scss'],
  standalone: false,
})
export class PlayerActionsComponent implements OnInit {
  @ViewChild(PositionSelectorComponent)
  private positionSelector!: PositionSelectorComponent;

  @Input() turnDetails: TurnDetail = {
    gameSessionId: 0,
    turnNumber: 0,
    playerId: 0,
    playerPosition: 0,
    playerTotalMoney: 0,
    playerDebit: 0,
    playerCredit: 0,
  };

  @Output() saved: EventEmitter<void> = new EventEmitter<void>();

  isModalOpen = false;
  boardCells: BoardCell[] = BOARD_CELLS;

  ngOnInit() {}

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  save() {
    this.saved.emit();
    this.isModalOpen = false;
  }

  onClick() {
    this.positionSelector.setOpen(true);
  }

  onPositionSelected($event: number) {
    this.turnDetails.playerPosition = $event;
  }
}
