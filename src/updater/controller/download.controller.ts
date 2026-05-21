import { TypedParam } from '@nestia/core';
import {
  Controller,
  Get,
  NotFoundException,
  Res,
  Headers,
  HttpStatus,
} from '@nestjs/common';
import express from 'express';
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
    @TypedParam('filename') filename: string,
    @Headers('range') range: string,
    @Res() res: express.Response
  ): void {
    const filePath = join(
      process.cwd(),
      'downloads',
      'slimevr-server',
      branch,
      version,
      filename
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const stats = statSync(filePath);
    const fileSize = stats.size;

    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res
          .status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
          .header({
            'Content-Range': `bytes */${fileSize}`,
          })
          .send();
        return;
      }

      const chunkSize = end - start + 1;
      const fileStream = createReadStream(filePath, { start, end });

      res.status(HttpStatus.PARTIAL_CONTENT).header({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
      });

      fileStream.pipe(res);
    } else {
      res.status(HttpStatus.OK).header({
        'Accept-Ranges': 'bytes',
        'Content-Length': fileSize,
      });

      const fileStream = createReadStream(filePath);
      fileStream.pipe(res);
    }
  }
}
