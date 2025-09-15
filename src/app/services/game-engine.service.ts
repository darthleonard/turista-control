import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { PropertyService } from './property.service';
import {
  GameConfig,
  GameHistory,
  GameState,
  Player,
  PlayerState,
  Property,
} from '../database/local-database';

export interface ActiveGame {
  configId: number;
  state: GameState;
}

@Injectable({ providedIn: 'root' })
export class GameEngineService {
  private currentGame: ActiveGame | null = null;

  constructor(
    private readonly gameService: GameService,
    private readonly propertyService: PropertyService
  ) {}

  async startNewGame(
    config: Omit<GameConfig, 'id'>,
    players: Player[]
  ): Promise<number> {
    const configId = await this.gameService.createGame(config);

    if (players.some((p) => p.id === undefined))
      throw new Error('All players must have an ID');

    const initialPlayersState: { [playerId: number]: PlayerState } = {};
    for (const player of players) {
      initialPlayersState[player.id!] = {
        playerId: player.id!,
        cash: config.initialMoney,
        position: 0,
        properties: [],
      };
    }

    const state: GameState = {
      gameConfigId: configId,
      turnNumber: 0,
      currentPlayerId: players[0].id!,
      playersState: initialPlayersState,
      log: [
        `Game "${config.name}" started with players: ${players
          .map((p) => p.name)
          .join(', ')}`,
      ],
    };

    const stateId = await this.gameService.saveState(state);
    this.currentGame = { configId, state: { ...state, id: stateId } };

    return configId;
  }

  async endGame(
    configId: number,
    winnerId: number
  ): Promise<number | undefined> {
    const state = await this.gameService.getStateByConfig(configId);
    if (!state) return undefined;

    const stats: GameHistory['stats'] = {};
    const allProperties = await this.propertyService.getAll();

    for (const [pid, playerState] of Object.entries(state.playersState)) {
      const playerId = Number(pid);
      const ps = playerState as PlayerState;

      const propertiesValue = ps.properties.reduce(
        (sum: number, propId: number) => {
          const property = allProperties.find((p) => p.id === propId);
          return sum + (property?.value || 0);
        },
        0
      );

      stats[playerId] = {
        properties: ps.properties.length,
        cash: ps.cash,
        totalValue: ps.cash + propertiesValue,
      };
    }

    const historyId = await this.gameService.saveHistory({
      gameConfigId: configId,
      totalTurns: state.turnNumber,
      winnerId,
      stats,
      finishedAt: new Date(),
    });

    this.currentGame = null;
    return historyId;
  }

  async resumeGame(configId: number): Promise<void> {
    const state = await this.gameService.getStateByConfig(configId);
    if (!state) throw new Error('No saved state found');

    this.currentGame = { configId, state };
  }

  getCurrentGame(): ActiveGame | null {
    return this.currentGame;
  }

  async nextTurn(): Promise<GameState> {
    if (!this.currentGame) throw new Error('No active game');

    const state = this.currentGame.state;
    const playerIds = Object.keys(state.playersState).map(Number);
    const currentIndex = playerIds.indexOf(state.currentPlayerId);
    const nextIndex = (currentIndex + 1) % playerIds.length;

    state.currentPlayerId = playerIds[nextIndex];
    state.turnNumber += 1;
    state.log.push(
      `Turn ${state.turnNumber}: Player ${state.currentPlayerId}'s turn`
    );

    const stateId = await this.gameService.saveState(state);
    this.currentGame.state.id = stateId;
    return this.currentGame.state;
  }

  async movePlayer(playerId: number, steps: number): Promise<void> {
    if (!this.currentGame) throw new Error('No active game');

    const state = this.currentGame.state;
    const playerState = state.playersState[playerId];
    if (!playerState) throw new Error('Player not found in game');

    playerState.position += steps;
    state.log.push(
      `Player ${playerId} moved ${steps} steps to position ${playerState.position}`
    );

    const stateId = await this.gameService.saveState(state);
    this.currentGame.state.id = stateId;
  }

  async buyProperty(playerId: number, propertyId: number): Promise<void> {
    if (!this.currentGame) throw new Error('No active game');

    const state = this.currentGame.state;
    const playerState = state.playersState[playerId];
    const property = await this.propertyService.getById(propertyId);
    if (!playerState || !property)
      throw new Error('Player or property not found');

    if (playerState.cash < property.value) throw new Error('Not enough cash');

    playerState.cash -= property.value;
    playerState.properties.push(propertyId);

    state.log.push(
      `Player ${playerId} bought property ${property.name} for ${property.value}`
    );

    const stateId = await this.gameService.saveState(state);
    this.currentGame.state.id = stateId;
  }

  async payRent(
    playerId: number,
    propertyId: number,
    ownerId: number
  ): Promise<void> {
    if (!this.currentGame) throw new Error('No active game');

    const state = this.currentGame.state;
    const playerState = state.playersState[playerId];
    const ownerState = state.playersState[ownerId];
    const property = await this.propertyService.getById(propertyId);

    if (!playerState || !ownerState || !property)
      throw new Error('Invalid player, owner or property');

    if (playerState.cash < property.value)
      throw new Error('Not enough cash to pay rent');

    playerState.cash -= property.value;
    ownerState.cash += property.value;

    state.log.push(
      `Player ${playerId} paid ${property.value} rent to Player ${ownerId} for property ${property.name}`
    );

    const stateId = await this.gameService.saveState(state);
    this.currentGame.state.id = stateId;
  }
}
