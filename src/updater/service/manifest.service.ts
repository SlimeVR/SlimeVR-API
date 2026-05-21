import { Injectable } from '@nestjs/common';
import { generateManifest } from '../manifest/generateManifest';
import { Channel, Version, Release } from '../../db/schema';
import { DatabaseService } from '../../db/db.service';
import { API_URL } from '../../env';
import { and, eq } from 'drizzle-orm';
import path from 'path';
import * as fs from 'fs/promises';
import { firstValueFrom } from 'rxjs';
import { createReadStream, createWriteStream } from 'fs';
import { HttpService } from '@nestjs/axios';
import { createGzip, createDeflate } from 'zlib';
import { pipeline } from 'stream/promises';

let manifest: unknown;

async function loadManifest(): Promise<void> {
  if (manifest === undefined) {
    try {
      manifest = (
        await import('../../../manifests/update-manifest.json', {
          with: { type: 'json' },
        })
      ).default;
    } catch {
      console.error('Failed to load manifest');
      manifest = {};
    }
  }
}

function normalizeUrlFilename(url: string) {
  try {
    const parsed = new URL(url);
    const pathSegments = parsed.pathname.split('/');
    if (pathSegments.length > 0) {
      const filename = pathSegments.pop();
      if (filename) {
        pathSegments.push(filename.toLowerCase());
        parsed.pathname = pathSegments.join('/');
      }
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

@Injectable()
export class ManifestService {
  constructor(
    private dbService: DatabaseService,
    private readonly httpService: HttpService
  ) {}
  async createManifest() {
    const manifestGenerator = new generateManifest();
    await manifestGenerator.generateManifest();
  }

  async downloadFilesFromManifest() {
    await loadManifest();
    const channels = (manifest as Record<string, unknown>).channels || {};

    for (const [channelSlug, channelData] of Object.entries(channels)) {
      const channel = channelData as Record<string, unknown>;
      for (const [versionSemver, versionData] of Object.entries(
        channel.versions as Record<string, unknown>
      )) {
        const version = versionData as Record<string, unknown>;
        const builds = (version.builds as Record<string, unknown>) || {};

        const targetDir = path.join(
          'downloads',
          'slimevr-server',
          channelSlug,
          versionSemver
        );
        await fs.mkdir(targetDir, { recursive: true });

        console.log(`--- Processing ${channelSlug} | ${versionSemver} ---`);

        for (const [, architectures] of Object.entries(builds)) {
          for (const [, releaseData] of Object.entries(
            architectures as Record<string, unknown>
          )) {
            const release = releaseData as Record<string, unknown>;
            const url = release.url as string;
            if (!url) continue;

            const baseFilename = url.split('/').pop()?.toLowerCase();
            if (!baseFilename) continue;

            const isAppImage = baseFilename.endsWith('.appimage');

            const targetFilename = isAppImage
              ? `${baseFilename}.zip`
              : baseFilename;
            const destPath = path.join(targetDir, targetFilename);

            try {
              const existingFiles = await fs.readdir(targetDir);
              const normalizedExistingFiles = existingFiles.map((f) =>
                f.toLowerCase()
              );

              if (normalizedExistingFiles.includes(targetFilename)) {
                const exactExistingFile = existingFiles.find(
                  (f) => f.toLowerCase() === targetFilename
                );
                if (exactExistingFile && exactExistingFile !== targetFilename) {
                  console.log(
                    `Normalizing existing filename ${exactExistingFile} to ${targetFilename}`
                  );
                  await fs.rename(
                    path.join(targetDir, exactExistingFile),
                    destPath
                  );
                } else {
                  console.log(`Skipping: ${targetFilename} (Already exists)`);
                }
                continue;
              }

              if (
                isAppImage &&
                normalizedExistingFiles.includes(baseFilename)
              ) {
                const uncompressedFile = existingFiles.find(
                  (f) => f.toLowerCase() === baseFilename
                )!;
                const uncompressedPath = path.join(targetDir, uncompressedFile);

                console.log(
                  `Found uncompressed file: ${uncompressedFile}. Compressing to ZIP...`
                );

                await pipeline(
                  createReadStream(uncompressedPath),
                  createDeflate(),
                  createWriteStream(destPath)
                );

                console.log(
                  `Compression complete. Deleting original: ${uncompressedFile}`
                );
                await fs.unlink(uncompressedPath);
                continue;
              }

              console.log(`Downloading: ${targetFilename}...`);

              const response = await firstValueFrom(
                this.httpService.get(url, { responseType: 'stream' })
              );

              const downloadStream = response.data as NodeJS.ReadableStream;
              const writer = createWriteStream(destPath);

              if (isAppImage) {
                console.log(
                  `Compressing AppImage on-the-fly into: ${targetFilename}`
                );
                await pipeline(downloadStream, createGzip(), writer);
              } else {
                await pipeline(downloadStream, writer);
              }

              console.log(`Successfully saved to ${destPath}`);
            } catch (error: unknown) {
              const errorMsg =
                error instanceof Error ? error.message : String(error);
              console.error(`Failed to process ${url}: ${errorMsg}`);
            }
          }
        }
      }
    }
  }

  async seedfromManifest() {
    await loadManifest();
    const manifestData = manifest as Record<string, unknown>;
    for (const [channelSlug, channelData] of Object.entries(
      manifestData.channels as Record<string, unknown>
    )) {
      const channel = channelData as Record<string, unknown>;
      const [existingChannel] = await this.dbService.db
        .select()
        .from(Channel)
        .where(eq(Channel.name, channelSlug))
        .limit(1);

      const [insertedChannel] = existingChannel
        ? [existingChannel]
        : await this.dbService.db
            .insert(Channel)
            .values({
              name: channelSlug,
              description: channel.description as string,
              defaultChannel:
                (manifestData.default_channel as string) === channelSlug,
            })
            .returning();

      if (existingChannel) {
        console.log(`Channel already exists: ${existingChannel.name}`);
      }

      console.log(`Channel: ${insertedChannel.name}`);

      for (const [versionSemver, versionData] of Object.entries(
        channel.versions as Record<string, unknown>
      )) {
        const version = versionData as Record<string, unknown>;
        const [existingVersion] = await this.dbService.db
          .select()
          .from(Version)
          .where(
            and(
              eq(Version.channelId, insertedChannel.id),
              eq(Version.semver, versionSemver)
            )
          )
          .limit(1);

        const [insertedVersion] = existingVersion
          ? [existingVersion]
          : await this.dbService.db
              .insert(Version)
              .values({
                semver: versionSemver,
                changelog: (version.release_notes as string) || '',
                channelId: insertedChannel.id,
              })
              .returning();

        if (existingVersion) {
          console.log(
            `Version already exists: ${existingVersion.semver} (${channelSlug})`
          );
        }

        console.log(`Version: ${insertedVersion.semver}`);

        for (const [platform, architectures] of Object.entries(
          version.builds as Record<string, unknown>
        )) {
          for (const [arch, releaseData] of Object.entries(
            architectures as Record<string, unknown>
          )) {
            const release = releaseData as Record<string, unknown>;
            let sourceUrl = release.url as string;

            if (sourceUrl.toLowerCase().endsWith('.appimage')) {
              sourceUrl = `${sourceUrl}.zip`;
            }

            const goodUrl = sourceUrl.replace(
              'https://github.com/SlimeVR/SlimeVR-Server/releases/download/',
              `${API_URL}/download/stable/`
            );
            const normalizedGoodUrl = normalizeUrlFilename(goodUrl);
            console.log(`Release URL: ${normalizedGoodUrl}`);
            const [existingRelease] = await this.dbService.db
              .select()
              .from(Release)
              .where(
                and(
                  eq(Release.versionId, insertedVersion.id),
                  eq(Release.platform, platform),
                  eq(Release.architecture, arch)
                )
              )
              .limit(1);

            if (existingRelease) {
              console.log(
                `Skipping duplicate release for ${platform}/${arch} ${versionSemver}`
              );
              continue;
            }

            await this.dbService.db.insert(Release).values({
              platform: platform,
              architecture: arch,
              url: normalizedGoodUrl,
              checksum: (release.checksum as string) || 'N/A',
              run: release.run || [],
              versionId: insertedVersion.id,
            });
          }
        }
      }
    }
  }
}
