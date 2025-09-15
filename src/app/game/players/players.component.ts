import { Component, EventEmitter, Output } from '@angular/core';
import { localDatabase, Player } from 'src/app/database/local-database';

@Component({
  selector: 'app-players',
  templateUrl: 'players.component.html',
  styleUrls: ['players.component.css'],
  standalone: false,
})
export class PlayersComponent {
  @Output() acceept = new EventEmitter<Player[]>();

  isModalOpen = false;
  players: Player[] = [];
  playersSelected: Player[] = [];

  setOpen(isOpen: boolean) {
    if (isOpen) {
      this.loadPlayers();
    }
    this.isModalOpen = isOpen;
  }

  onAccept() {
    this.isModalOpen = false;
    this.acceept.emit(this.playersSelected);
  }

  onPlayerSelected(player: Player) {
    const playerIndex = this.playersSelected.findIndex(
      (p) => p.id === player.id
    );
    if (playerIndex >= 0) {
      this.playersSelected.splice(playerIndex, 1);
      //player.selected = false;
    } else {
      this.playersSelected.push(player);
      //player.selected = true;
    }
  }

  private async loadPlayers() {
    this.players = await localDatabase.players.toArray();
  }
}
