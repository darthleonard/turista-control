import { Injectable } from '@angular/core';
import { localDatabase, Property } from '../database/local-database';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  async getAll(): Promise<Property[]> {
    return localDatabase.properties.toArray();
  }

  async getById(id: number): Promise<Property | undefined> {
    return localDatabase.properties.get(id);
  }

  async add(property: Property): Promise<number> {
    return localDatabase.properties.add(property);
  }

  async update(id: number, changes: Partial<Property>): Promise<number> {
    return localDatabase.properties.update(id, changes);
  }

  async delete(id: number): Promise<void> {
    await localDatabase.properties.delete(id);
  }
}
