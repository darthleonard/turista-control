import Dexie from 'dexie';

//
// Catálogo global de jugadores (miembros de la familia)
//
export interface Player {
  id?: number;
  name: string;
  image?: string;
}

//
// Catálogo de propiedades/casillas del tablero
//
export interface Property {
  id?: number;
  name: string; // "Avenida Reforma", "Ferrocarril"
  type: 'property' | 'station' | 'utility' | 'special';
  position: number; // índice/casilla en el tablero
  price?: number; // costo de compra (si aplica)
  rent?: number; // renta base
  group?: string; // color/zona ("Rojo", "Verde", "Estación")
}

//
// Configuración inicial de una partida
//
export interface GameConfig {
  id?: number;
  name: string; // nombre de la sesión de juego ("Partida con primos")
  createdAt: Date;
  initialMoney: number;
  boardConfig: string; // JSON con reglas especiales / config de tablero
  playerIds: number[]; // referencias a jugadores seleccionados
  bankPlayerId: number; // jugador que actúa como banco
}

//
// Estado actual de la partida
//
export interface GameState {
  id?: number;
  gameConfigId: number; // referencia a la configuración
  turnNumber: number;
  currentPlayerId: number;
  playersState: {
    [playerId: number]: {
      cash: number;
      properties: number[]; // referencias a Property.id
      position: number; // casilla actual
    };
  };
  log: string[]; // eventos ("Ana compró Avenida Reforma")
  updatedAt: Date;
  isFinished: boolean;
}

//
// Historial de partidas finalizadas
//
export interface GameHistory {
  id?: number;
  gameConfigId: number; // vincular con la configuración inicial
  finishedAt: Date;
  totalTurns: number;
  winnerId: number;
  stats: {
    [playerId: number]: {
      properties: number; // cuántas propiedades posee
      cash: number;
      totalValue: number; // cash + valor de propiedades
    };
  };
}

//
// Definición Dexie
//
export class LocalDatabase extends Dexie {
  players!: Dexie.Table<Player, number>;
  properties!: Dexie.Table<Property, number>;
  gameConfigs!: Dexie.Table<GameConfig, number>;
  gameStates!: Dexie.Table<GameState, number>;
  gameHistories!: Dexie.Table<GameHistory, number>;

  constructor() {
    super('turista-control');

    this.version(1).stores({
      players: '++id, name',
      properties: '++id, position, name',
      gameConfigs: '++id, createdAt',
      gameStates: '++id, gameConfigId, updatedAt',
      gameHistories: '++id, gameConfigId, finishedAt',
    });

    this.players = this.table('players');
    this.properties = this.table('properties');
    this.gameConfigs = this.table('gameConfigs');
    this.gameStates = this.table('gameStates');
    this.gameHistories = this.table('gameHistories');
  }
}

export const localDatabase = new LocalDatabase();
