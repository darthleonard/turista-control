import { Component, OnInit } from '@angular/core';
import { GameEngineService } from '../services/game-engine.service';
import { GameService } from '../services/game.service';
import { Player, GameConfig, GameState } from '../database/local-database';
import { localDatabase } from '../database/local-database';

@Component({
  selector: 'app-game-session',
  templateUrl: './game-session.component.html',
  styleUrls: ['./game-session.component.scss'],
  standalone: false,
})
export class GameSessionComponent implements OnInit {
  players: Player[] = [];
  gameState: GameState | null = null;
  currentPlayerId: number | null = null;

  constructor(
    private readonly gameEngine: GameEngineService,
    private readonly gameService: GameService
  ) {}

  async ngOnInit() {
    // Cargar jugadores existentes
    this.players = await localDatabase.players.toArray();

    // Intentar reanudar juego existente
    const currentGame = this.gameEngine.getCurrentGame();
    if (currentGame) {
      await this.updateState();
    }
  }

  /** Inicia una nueva partida */
  async startNewGame() {
    if (!this.players.length) return alert('No hay jugadores registrados');

    const config: Omit<GameConfig, 'id'> = {
      name: 'Partida de prueba',
      initialMoney: 1500,
      boardConfig: 'default-board',
      playerIds: this.players.map((p) => p.id),
      bankPlayerId: this.players[0].id!,
    };

    await this.gameEngine.startNewGame(config, this.players);
    await this.updateState();
  }

  // Avanzar al siguiente turno
  async nextTurn() {
    const state = await this.gameEngine.nextTurn();
    if (state) this.gameState = state;
    this.currentPlayerId = this.gameState?.currentPlayerId ?? null;
  }

  // Mover jugador actual
  async movePlayer(steps: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.movePlayer(this.currentPlayerId, steps);
    await this.updateState();
  }

  // Comprar propiedad
  async buyProperty(propertyId: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.buyProperty(this.currentPlayerId, propertyId);
    await this.updateState();
  }

  // Pagar renta
  async payRent(propertyId: number, ownerId: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.payRent(this.currentPlayerId, propertyId, ownerId);
    await this.updateState();
  }

  // Finalizar juego
  async endGame(winnerId: number) {
    if (!this.gameState) return;
    const historyId = await this.gameEngine.endGame(
      this.gameState.gameConfigId,
      winnerId
    );
    console.log('Juego finalizado, history id:', historyId);
    this.gameState = null;
  }

  // Getters seguros
  getPlayerPropertiesLength(playerId: number): number {
    const ps = this.gameState?.playersState[playerId];
    return ps ? ps.properties.length : 0;
  }

  getPlayerCash(playerId: number): number {
    const ps = this.gameState?.playersState[playerId];
    return ps ? ps.cash : 0;
  }

  // Actualiza el estado local desde el engine
  private async updateState() {
    const game = this.gameEngine.getCurrentGame();
    if (game) {
      this.gameState = game.state;
      this.currentPlayerId = game.state.currentPlayerId;
    }
  }
}
