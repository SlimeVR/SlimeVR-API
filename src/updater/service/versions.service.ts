import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as schema from '../../db/schema';
import { DatabaseService } from '../../db/db.service';
import { and, desc, eq, ilike, notLike } from 'drizzle-orm';
import type { Version } from '../types';
import { ChannelsService } from './channels.service';

@Injectable()
export class VersionsService {
  constructor(
    private dbService: DatabaseService,
    private channelsService: ChannelsService
  ) {}

  async getAllVersionsFromDefaultChannel() {
    const channel = await this.channelsService.getDefaultChannel();

    if (!channel) {
      throw new NotFoundException('Default channel not configured');
    }

    const res = await this.dbService.db
      .select()
      .from(schema.Version)
      .where(eq(schema.Version.channelId, channel.id));

    return res;
  }

  async getLatestDefaultVersion() {
    const channel = await this.channelsService.getDefaultChannel();

    if (!channel) {
      throw new NotFoundException('Default channel not configured');
    }

    const [res] = await this.dbService.db
      .select()
      .from(schema.Version)
      .where(
        and(
          eq(schema.Version.channelId, channel.id),
          notLike(schema.Version.semver, '%rc%')
        )
      )
      .orderBy(desc(schema.Version.semver))
      .limit(1);

    return res;
  }

  async getAllVersionsFromChannelByName(name: string) {
    const [channel] = await this.dbService.db
      .select()
      .from(schema.Channel)
      .where(ilike(schema.Channel.name, name))
      .limit(1);

    if (!channel) {
      throw new NotFoundException(`Channel ${name} does not exist`);
    }

    const res = await this.dbService.db
      .select()
      .from(schema.Version)
      .where(eq(schema.Version.channelId, channel.id));

    return res;
  }

  async addVersionToChannel(version: Version) {
    const [channel] = await this.dbService.db
      .select()
      .from(schema.Channel)
      .where(ilike(schema.Channel.name, version.channel))
      .limit(1);

    if (!channel) {
      throw new BadRequestException(
        `Cannot add version: Channel ID ${version.channel} not found`
      );
    }

    const [existing] = await this.dbService.db
      .select()
      .from(schema.Version)
      .where(
        and(
          eq(schema.Version.channelId, channel.id),
          eq(schema.Version.semver, version.semver)
        )
      )
      .limit(1);

    if (existing) {
      throw new ConflictException(
        `Version ${version.semver} already exists in this channel`
      );
    }

    const [res] = await this.dbService.db
      .insert(schema.Version)
      .values({
        semver: version.semver,
        changelog: version.changelog,
        channelId: channel.id,
      })
      .returning();

    return res;
  }
}
