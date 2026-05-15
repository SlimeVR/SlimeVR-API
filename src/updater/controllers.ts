import { ManifestController } from './controller/manifest.controller';
import { ChannelsController } from './controller/channels.controller';
import { VersionsController } from './controller/version.controller';
import { ReleasesController } from './controller/releases.controller';
import { DownloadController } from './controller/download.controller';
import { UploadController } from './controller/upload.controller';

export { ManifestController };
export { ChannelsController };
export { VersionsController };
export { ReleasesController };
export { DownloadController };
export { UploadController };

export const Controllers = [
  ManifestController,
  ChannelsController,
  VersionsController,
  ReleasesController,
  DownloadController,
  UploadController,
];
