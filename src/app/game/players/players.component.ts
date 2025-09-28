import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { localDatabase, Player } from '../../database/local-database';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css'],
  standalone: false,
})
export class PlayersComponent implements OnInit {
  players: Player[] = [];
  playersSelected: Player[] = [];
  bankPlayerId?: number;

  constructor(private modalCtrl: ModalController) {}

  async ngOnInit() {
    await this.loadPlayers();
  }

  /** Confirmar selección y cerrar modal */
  onAccept() {
    if (!this.playersSelected.length) {
      alert('Selecciona al menos un jugador');
      return;
    }
    if (!this.bankPlayerId) {
      alert('Selecciona quién será el banco');
      return;
    }

    this.modalCtrl.dismiss({
      players: this.playersSelected,
      bankPlayerId: this.bankPlayerId,
    });
  }

  /** Cancelar selección y cerrar modal */
  onCancel() {
    this.modalCtrl.dismiss(null);
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
