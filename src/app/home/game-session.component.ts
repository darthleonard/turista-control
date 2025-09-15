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
  gameState: GameState | null = null;
  players: Player[] = [];
  currentPlayerId: number | null = null;

  constructor(
    private readonly gameEngine: GameEngineService,
    private readonly gameService: GameService
  ) {}

  async ngOnInit() {
    this.players = await localDatabase.players.toArray();

    if (this.players.length === 0) return;

    const config: Omit<GameConfig, 'id'> = {
      name: 'Partida de prueba',
      initialMoney: 1500,
      boardConfig: 'default-board',
      playerIds: this.players.map((p) => p.id),
      bankPlayerId: this.players[0].id!,
    };

    const configId = await this.gameEngine.startNewGame(config, this.players);
    await this.updateState();
  }

  async nextTurn() {
    if (!this.gameEngine.getCurrentGame()) return;
    this.gameState = await this.gameEngine.nextTurn();
    this.currentPlayerId = this.gameState.currentPlayerId;
  }

  async movePlayer(steps: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.movePlayer(this.currentPlayerId, steps);
    await this.updateState();
  }

  async buyProperty(propertyId: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.buyProperty(this.currentPlayerId, propertyId);
    await this.updateState();
  }

  async payRent(propertyId: number, ownerId: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.payRent(this.currentPlayerId, propertyId, ownerId);
    await this.updateState();
  }

  async endGame(winnerId: number) {
    if (!this.gameState) return;
    const historyId = await this.gameEngine.endGame(
      this.gameState.gameConfigId,
      winnerId
    );
    console.log('Game finished, history id:', historyId);
    this.gameState = null;
  }

  // Getter seguro para propiedades
  getPlayerPropertiesLength(playerId: number): number {
    const ps = this.gameState?.playersState[playerId];
    return ps ? ps.properties.length : 0;
  }

  private async updateState() {
    const game = this.gameEngine.getCurrentGame();
    if (game) {
      this.gameState = game.state;
      this.currentPlayerId = game.state.currentPlayerId;
    }
  }
}
