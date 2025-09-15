import Dexie from 'dexie';

export interface Player {
  id: number;
  name: string;
  image?: string;
}

export interface Property {
  id: number;
  name: string;
  value: number;
}

export interface PlayerState {
  playerId: number;
  cash: number;
  position: number;
  properties: number[];
}

export interface GameState {
  id?: number;
  gameConfigId: number;
  turnNumber: number;
  currentPlayerId: number;
  playersState: { [playerId: number]: PlayerState };
  log: string[];
  updatedAt?: Date;
}

export interface GameConfig {
  id?: number;
  name: string;
  createdAt?: Date;
  initialMoney: number;
  boardConfig: string;
  playerIds: number[];
  bankPlayerId: number;
}

export interface GameHistory {
  id?: number;
  gameConfigId: number;
  totalTurns: number;
  winnerId: number;
  stats: {
    [playerId: number]: {
      properties: number;
      cash: number;
      totalValue: number;
    };
  };
  finishedAt: Date;
}

export class LocalDatabase extends Dexie {
  players: Dexie.Table<Player, number>;
  properties: Dexie.Table<Property, number>;
  gameConfigs: Dexie.Table<GameConfig, number>;
  gameStates: Dexie.Table<GameState, number>;
  gameHistories: Dexie.Table<GameHistory, number>;

  constructor() {
    super('turista-control');
    this.version(1).stores({
      players: 'id++',
      properties: 'id++',
      gameConfigs: 'id++',
      gameStates: 'id++',
      gameHistories: 'id++',
    });

    this.players = this.table('players');
    this.properties = this.table('properties');
    this.gameConfigs = this.table('gameConfigs');
    this.gameStates = this.table('gameStates');
    this.gameHistories = this.table('gameHistories');
  }
}

export const localDatabase = new LocalDatabase();
