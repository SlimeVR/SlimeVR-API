import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/db.service';
import { Release } from '../types';
import { ChannelsService } from './channels.service';
import { VersionsService } from './versions.service';
import * as Schema from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ReleasesService {
  constructor(
    private dbService: DatabaseService,
    private channelService: ChannelsService,
    private versionService: VersionsService
  ) {}

  async getLatestStable() {
    const latestVersion = await this.versionService.getLatestDefaultVersion();

    const latestRelease = await this.dbService.db
      .select()
      .from(Schema.Release)
      .where(eq(Schema.Release.versionId, latestVersion.id));

    return latestRelease.map((release) => ({
      architecture: release.architecture,
      checksum: release.checksum,
      platform: release.platform,
      run: release.run,
      url: release.url,
      version: latestVersion.semver,
    }));
  }

  async getVersionBysemver(semver: string) {}

  async addRelease(release: Release) {}
}
