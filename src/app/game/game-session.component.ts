import { Component, OnInit, ViewChild } from '@angular/core';
import { GameEngineService } from '../services/game-engine.service';
import { GameService } from '../services/game.service';
import { Player, GameConfig, GameState } from '../database/local-database';
import { PlayersComponent } from './players/players.component';

@Component({
  selector: 'app-game-session',
  templateUrl: './game-session.component.html',
  styleUrls: ['./game-session.component.scss'],
  standalone: false,
})
export class GameSessionComponent implements OnInit {
  @ViewChild(PlayersComponent) private playerSelector!: PlayersComponent;

  players: Player[] = [];
  gameState: GameState | null = null;
  currentPlayerId: number | null = null;

  constructor(
    private readonly gameEngine: GameEngineService,
    private readonly gameService: GameService
  ) {}

  async ngOnInit() {
    // Intentar reanudar partida existente
    const currentGame = this.gameEngine.getCurrentGame();
    if (currentGame) {
      await this.updateState();
    }
  }

  /** Abrir modal para seleccionar jugadores */
  startNewGame() {
    this.playerSelector?.setOpen(true);
  }

  async onPlayersSelected(event: { players: Player[]; bankPlayerId: number }) {
    const selectedPlayers = event.players;
    const bankPlayerId = event.bankPlayerId;

    const config: Omit<GameConfig, 'id'> = {
      name: 'Partida de prueba',
      initialMoney: 1500,
      boardConfig: 'default-board',
      playerIds: selectedPlayers.map((p) => p.id),
      bankPlayerId: bankPlayerId,
    };

    await this.gameEngine.startNewGame(config, selectedPlayers);
    await this.updateState();
  }

  /** Avanzar turno */
  async nextTurn() {
    const state = await this.gameEngine.nextTurn();
    if (state) this.gameState = state;
    this.currentPlayerId = this.gameState?.currentPlayerId ?? null;
  }

  /** Mover jugador actual */
  async movePlayer(steps: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.movePlayer(this.currentPlayerId, steps);
    await this.updateState();
  }

  /** Comprar propiedad */
  async buyProperty(propertyId: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.buyProperty(this.currentPlayerId, propertyId);
    await this.updateState();
  }

  /** Pagar renta */
  async payRent(propertyId: number, ownerId: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.payRent(this.currentPlayerId, propertyId, ownerId);
    await this.updateState();
  }

  /** Finalizar juego */
  async endGame(winnerId: number) {
    if (!this.gameState) return;
    const historyId = await this.gameEngine.endGame(
      this.gameState.gameConfigId,
      winnerId
    );
    console.log('Juego finalizado, history id:', historyId);
    this.gameState = null;
  }

  /** Getters seguros para mostrar información en la UI */
  getPlayerPropertiesLength(playerId: number): number {
    const ps = this.gameState?.playersState[playerId];
    return ps ? ps.properties.length : 0;
  }

  getPlayerCash(playerId: number): number {
    const ps = this.gameState?.playersState[playerId];
    return ps ? ps.cash : 0;
  }

  /** Actualiza el estado de juego desde el engine */
  private async updateState() {
    const game = this.gameEngine.getCurrentGame();
    if (game) {
      this.gameState = game.state;
      this.currentPlayerId = game.state.currentPlayerId;
    }
  }
}
