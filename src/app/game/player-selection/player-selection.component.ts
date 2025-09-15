import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { GameEngineService } from '../../services/game-engine.service';
import { Player } from '../../database/local-database';

@Component({
  selector: 'app-player-selection',
  templateUrl: './player-selection.component.html',
  styleUrls: ['./player-selection.component.scss'],
})
export class PlayerSelectionComponent implements OnInit {
  players: Player[] = [];
  selectedPlayerIds: number[] = [];
  bankPlayerId?: number;

  constructor(
    private playerService: PlayerService,
    private gameEngine: GameEngineService
  ) {}

  async ngOnInit() {
    this.players = await this.playerService.getAll();
  }

  toggleSelection(playerId: number) {
    if (this.selectedPlayerIds.includes(playerId)) {
      this.selectedPlayerIds = this.selectedPlayerIds.filter(
        (id) => id !== playerId
      );
    } else {
      this.selectedPlayerIds.push(playerId);
    }
  }

  setBank(playerId: number) {
    this.bankPlayerId = playerId;
  }

  async startGame() {
    if (this.selectedPlayerIds.length < 2 || !this.bankPlayerId) {
      alert('Selecciona al menos 2 jugadores y define un banco');
      return;
    }

    const { configId } = await this.gameEngine.startNewGame(
      'Nueva partida',
      this.selectedPlayerIds,
      this.bankPlayerId,
      1500, // dinero inicial
      'default-board' // tablero por defecto
    );

    alert(`Juego creado con ID: ${configId}`);
    // Aquí podrías redirigir al componente de GameSession
  }
}
