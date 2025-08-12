import { ObjectLiteral, Repository } from 'typeorm';

export interface SyncableService<T extends ObjectLiteral> {
  getRepository(): Repository<T>;
}
