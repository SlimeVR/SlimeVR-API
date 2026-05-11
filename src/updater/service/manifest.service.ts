import { Injectable } from '@nestjs/common';
import { generateManifest } from '../manifest/generateManifest';
import { Channel, Version, Release } from '../../db/schema';
import manifest from '../../../manifests/update-manifest.json';
import { DatabaseService } from '../../db/db.service';

@Injectable()
export class ManifestService {
  constructor(private dbService: DatabaseService) {}
  async createManifest() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const manifest = new generateManifest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await manifest.generateManifest();
  }

  async seedfromManifest() {
    for (const [channelSlug, channelData] of Object.entries(
      manifest.channels
    )) {
      const [insertedChannel] = await this.dbService.db
        .insert(Channel)
        .values({
          name: channelSlug,
          description: channelData.description,
          defaultChannel: manifest.default_channel === channelSlug,
        })
        .returning();

      console.log(`Channel: ${insertedChannel.name}`);

      for (const [versionSemver, versionData] of Object.entries(
        channelData.versions
      )) {
        const [insertedVersion] = await this.dbService.db
          .insert(Version)
          .values({
            semver: versionSemver,
            changelog: versionData.release_notes,
            channelId: insertedChannel.id,
          })
          .returning();

        console.log(`Version: ${insertedVersion.semver}`);

        for (const [platform, architectures] of Object.entries(
          versionData.builds
        )) {
          for (const [arch, releaseData] of Object.entries(architectures)) {
            await this.dbService.db.insert(Release).values({
              platform: platform,
              architecture: arch,
              url: releaseData.url,
              checksum: releaseData.checksum || 'N/A',
              run: releaseData.run,
              versionId: insertedVersion.id,
            });
          }
        }
      }
    }
  }
}
