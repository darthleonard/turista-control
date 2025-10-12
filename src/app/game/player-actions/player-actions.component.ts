import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TurnDetail } from 'src/app/models/turn-detail';

@Component({
  selector: 'app-player-actions',
  templateUrl: './player-actions.component.html',
  styleUrls: ['./player-actions.component.scss'],
  standalone: false,
})
export class PlayerActionsComponent implements OnInit {
  @Input() turnDetails: TurnDetail = {
    gameSessionId: 0,
    turnNumber: 0,
    playerId: 0,
    playerTotalMoney: 0,
    playerDebit: 0,
    playerCredit: 0,
  };

  @Output() saved: EventEmitter<void> = new EventEmitter<void>();

  isModalOpen = false;

  ngOnInit() {}

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  save() {
    this.saved.emit();
    this.isModalOpen = false;
  }
}
