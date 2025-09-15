import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { localDatabase, Player } from '../../database/local-database';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css'],
  standalone: false,
})
export class PlayersComponent implements OnInit {
  @Output() acceept = new EventEmitter<{
    players: Player[];
    bankPlayerId: number;
  }>();

  isModalOpen = false;
  players: Player[] = [];
  playersSelected: Player[] = [];
  bankPlayerId?: number;

  async ngOnInit() {
    await this.loadPlayers();
  }

  /** Abrir o cerrar modal */
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (isOpen) {
      this.loadPlayers();
      this.playersSelected = [];
      this.bankPlayerId = undefined;
    }
  }

  /** Confirmar selección y enviar al componente padre */
  onAccept() {
    if (!this.playersSelected.length) {
      alert('Selecciona al menos un jugador');
      return;
    }
    if (!this.bankPlayerId) {
      alert('Selecciona quién será el banco');
      return;
    }

    this.isModalOpen = false;
    this.acceept.emit({
      players: this.playersSelected,
      bankPlayerId: this.bankPlayerId,
    });
  }

  /** Seleccionar o deseleccionar jugador */
  onPlayerSelected(player: Player) {
    const index = this.playersSelected.findIndex((p) => p.id === player.id);
    if (index >= 0) {
      this.playersSelected.splice(index, 1);
      if (this.bankPlayerId === player.id) {
        this.bankPlayerId = undefined;
      }
    } else {
      this.playersSelected.push(player);
    }
  }

  /** Seleccionar jugador como banco */
  onBankSelected(player: Player) {
    if (!this.playersSelected.some((p) => p.id === player.id)) return;
    this.bankPlayerId = player.id;
  }

  /** Cargar jugadores desde la base de datos */
  private async loadPlayers() {
    this.players = await localDatabase.players.toArray();
  }

  /** Método auxiliar para saber si un jugador está seleccionado */
  isSelected(player: Player): boolean {
    return this.playersSelected.some((p) => p.id === player.id);
  }

  /** Método auxiliar para saber si un jugador es el banco */
  isBank(player: Player): boolean {
    return this.bankPlayerId === player.id;
  }
}
