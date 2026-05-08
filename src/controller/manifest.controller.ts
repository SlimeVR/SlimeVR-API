import { Controller, Get, Post, Res } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import type { Response } from 'express';
import { ManifestService } from '../services';

@Controller('manifest')
export class ManifestController {
  constructor(private readonly service: ManifestService) {}

  @Get()
  getFile(@Res() res: Response) {
    const file = createReadStream(
      join(process.cwd(), 'manifests/update-manifest.json')
    );
    file.pipe(res);
  }

  @Post()
  generateManifest() {
    console.log('generating release manifest');
    this.service.createManifest();
    return 'generating release manifest';
  }
}
