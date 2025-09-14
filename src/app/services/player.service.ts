import { Injectable } from '@angular/core';
import { localDatabase, Player } from '../database/local-database';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  async getAll(): Promise<Player[]> {
    return localDatabase.players.toArray();
  }

  async getById(id: number): Promise<Player | undefined> {
    return localDatabase.players.get(id);
  }

  async add(player: Player): Promise<number> {
    return localDatabase.players.add(player);
  }

  async update(id: number, changes: Partial<Player>): Promise<number> {
    return localDatabase.players.update(id, changes);
  }

  async delete(id: number): Promise<void> {
    await localDatabase.players.delete(id);
  }
}
