import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  private readonly db: NodePgDatabase;

  constructor(@Inject('URL') private url: string) {
    this.db = drizzle(url);
  }

  get(): NodePgDatabase {
    return this.db;
  }
}
