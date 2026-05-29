import AdmZip from 'adm-zip';
import { DatabaseService } from '../../db/db.service';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface ChecksumEntry {
  fileName: string;
  checksum: string;
}

export function calculateFileSha256(fileBuffer: Buffer): string {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

export function generateChecksumFile(filePath: string) {
  const cleanPath = filePath.startsWith('../')
    ? filePath.replace('../', './')
    : filePath;
  const absolutePath = path.resolve(process.cwd(), cleanPath);

  console.log('Looking for zip at:', absolutePath);

  const zip = new AdmZip(absolutePath);
  const zipEntries = zip.getEntries();

  const checksumEntries: ChecksumEntry[] = [];

  for (const zipEntry of zipEntries) {
    if (!(zipEntry.isDirectory || zipEntry.entryName.endsWith('/'))) {
      console.log(`Hashing zip entry: ${zipEntry.entryName}`);

      const fileBuffer = zipEntry.getData();
      const SHA = calculateFileSha256(fileBuffer);

      const checksumEntry: ChecksumEntry = {
        fileName: zipEntry.name,
        checksum: SHA,
      };

      checksumEntries.push(checksumEntry);
    }
  }

  zip.addFile(
    'checksum.json',
    Buffer.from(JSON.stringify(checksumEntries, null, 2))
  );

  zip.writeZip(absolutePath);
}

export class IntegrityService {
  constructor(private dbService: DatabaseService) {}

  generateChecksumForAllReleases() {
    const downloadsPath = path.resolve(process.cwd(), 'downloads');
    const getAllFiles = (source: string): string[] => {
      return fs
        .readdirSync(source, { withFileTypes: true })
        .reduce((files: string[], dirent) => {
          const fullPath = path.join(source, dirent.name);

          if (dirent.isDirectory()) {
            return [...files, ...getAllFiles(fullPath)];
          } else if (dirent.isFile()) {
            if (dirent.name.endsWith('.json')) {
              return files;
            }
            return [...files, fullPath];
          }

          return files;
        }, []);
    };

    const directoryArray = getAllFiles(downloadsPath);

    directoryArray.forEach((filePath) => {
      generateChecksumFile(filePath);
    });
  }
}
