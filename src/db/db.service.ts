import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  public readonly db: NodePgDatabase;

  constructor(@Inject('URL') private readonly url: string) {
    this.db = drizzle(url);
  }
}
