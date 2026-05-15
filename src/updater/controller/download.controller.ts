import { TypedParam } from '@nestia/core';
import {
  Controller,
  Get,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator';

@Public()
@ApiTags('Download')
@Controller('download')
export class DownloadController {
  @Get(':branch/:version/:filename')
  getFile(
    @TypedParam('branch') branch: string,
    @TypedParam('version') version: string,
    @TypedParam('filename') filename: string
  ): StreamableFile {
    const filePath = join(
      process.cwd(),
      'slimevr-server',
      branch,
      version,
      filename
    );

    console.log(filePath);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const fileStream = createReadStream(filePath);
    const stats = statSync(filePath);

    return new StreamableFile(fileStream, {
      type: 'application/octet-stream',
      disposition: `attachment; filename="${filename}"`,
      length: stats.size,
    });
  }
}
