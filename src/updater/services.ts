import { ChannelsService } from './service/channels.service';
import { ManifestService } from './service/manifest.service';
import { VersionsService } from './service/versions.service';
import { ReleasesService } from './service/releases.service';
import { IntegrityService } from './service/integrity.service';

export { ManifestService };
export { ChannelsService };
export { VersionsService };
export { ReleasesService };
export { IntegrityService };

export const Services = [
  ManifestService,
  ChannelsService,
  VersionsService,
  ReleasesService,
  IntegrityService,
];
