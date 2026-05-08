import { Injectable } from '@nestjs/common';
import { generateManifest } from 'src/manifest/generateManifest';

@Injectable()
export class ManifestService {
  createManifest() {
    const manifest = new generateManifest();
    manifest.generateManifest();
  }
}
