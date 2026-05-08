import { Injectable } from '@nestjs/common';
import * as schema from '../db/schema';
import { DatabaseService } from '../db/db.service';

@Injectable()
export class ChannelsService {
  constructor(private db: DatabaseService) {}

  async addReleaseChannel() {
    const res = await this.db
      .get()
      .insert(schema.Channel)
      .values({ id: '1', description: 'hello', defaultChannel: true })
      .returning();

    return res;
  }
}
