import { Injectable } from '@angular/core';
import {
  localDatabase,
  GameConfig,
  GameState,
  GameHistory,
} from '../database/local-database';

@Injectable({ providedIn: 'root' })
export class GameService {
  // Crear un nuevo juego
  async createGame(config: Omit<GameConfig, 'id'>): Promise<number> {
    const id = await localDatabase.gameConfigs.add(config);
    return id;
  }

  // Obtener juego por nombre
  async getByName(name: string): Promise<GameConfig | undefined> {
    return localDatabase.gameConfigs.where('name').equals(name).first();
  }

  // Guardar estado de juego
  async saveState(state: Omit<GameState, 'id'>): Promise<number> {
    const id = await localDatabase.gameStates.add(state);
    return id;
  }

  // Obtener estado por configId
  async getStateByConfig(configId: number): Promise<GameState | undefined> {
    return localDatabase.gameStates
      .where('gameConfigId')
      .equals(configId)
      .first();
  }

  // Guardar historial de juego
  async saveHistory(history: Omit<GameHistory, 'id'>): Promise<number> {
    const id = await localDatabase.gameHistories.add(history);
    return id;
  }

  // Actualizar estado existente
  async updateState(id: number, changes: Partial<GameState>): Promise<number> {
    return localDatabase.gameStates.update(id, changes);
  }
}
