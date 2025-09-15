import { Component, OnInit } from '@angular/core';
import { GameEngineService } from '../services/game-engine.service';
import { GameService } from '../services/game.service';
import { GameState, GameConfig } from '../database/local-database';

@Component({
  selector: 'app-game-session',
  templateUrl: './game-session.component.html',
  //styleUrls: ['./game-session.component.scss'],
  standalone: false,
})
export class GameSessionComponent implements OnInit {
  config?: GameConfig;
  state?: GameState;

  constructor(
    private gameEngine: GameEngineService,
    private gameService: GameService
  ) {}

  async ngOnInit() {
    // Ejemplo: iniciar partida con 2 jugadores (IDs 1 y 2), jugador 1 como banco
    const { configId } = await this.gameEngine.startNewGame(
      'Partida de prueba',
      [1, 2],
      1, // jugador banco
      1500,
      'default-board'
    );

    // Guardar referencia del config
    this.config = await this.gameService.getConfigById(configId);
    this.state = await this.gameService.getStateByConfig(configId);
  }

  async nextTurn() {
    if (!this.config || this.config.id === undefined) return;
    this.state = await this.gameEngine.nextTurn(this.config.id);
  }

  async endGame() {
    if (!this.config || this.config.id === undefined || !this.state) return;
    // Ejemplo: declaramos ganador al jugador actual
    await this.gameEngine.endGame(this.config.id, this.state.currentPlayerId);
    alert(`Juego finalizado. Ganador: Jugador ${this.state.currentPlayerId}`);
  }
}
