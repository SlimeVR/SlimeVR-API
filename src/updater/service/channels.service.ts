import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as schema from '../../db/schema';
import { DatabaseService } from '../../db/db.service';
import type { Channel } from '../types';
import { eq } from 'drizzle-orm';

@Injectable()
export class ChannelsService {
  constructor(private dbService: DatabaseService) {}

  async getAllReleaseChannels() {
    const res = await this.dbService.db.select().from(schema.Channel);

    return res;
  }

  //TODO: Write a better query
  async getDefaultChannel() {
    const res = await this.dbService.db
      .selectDistinct()
      .from(schema.Channel)
      .where(eq(schema.Channel.defaultChannel, true));

    const defaultChannel = res.pop();

    if (defaultChannel == null) {
      throw new NotFoundException('No default channel specified');
    }

    return defaultChannel;
  }

  async getChannelByName(name: string) {
    const [channel] = await this.dbService.db
      .select()
      .from(schema.Channel)
      .where(eq(schema.Channel.name, name))
      .limit(1);

    if (!channel) {
      throw new NotFoundException(`Channel with name "${name}" not found`);
    }

    return channel;
  }

  async addReleaseChannel(channel: Channel) {
    const existing = await this.dbService.db
      .select()
      .from(schema.Channel)
      .where(eq(schema.Channel.name, channel.name));

    if (existing.length > 0) {
      throw new ConflictException('Channel name already exists');
    }

    const [res] = await this.dbService.db
      .insert(schema.Channel)
      .values({
        name: channel.name,
        description: channel.description,
        defaultChannel: channel.defaultChannel,
      })
      .returning();

    return res;
  }
}
