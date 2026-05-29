import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestiaSwaggerComposer } from '@nestia/sdk';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { PORT } from './env';
import * as readline from 'readline';

import './instrument';
import NESTIA_CONFIG from '../nestia.config';
import { AuthService } from './auth/auth.service';
import { ManifestService } from './updater/services';
import { IntegrityService } from './updater/service/integrity.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const document = await NestiaSwaggerComposer.document(app, {
    ...NESTIA_CONFIG.swagger,
  });

  const openApiDoc = document as OpenAPIObject;

  openApiDoc.servers = [];

  SwaggerModule.setup('api', app, openApiDoc, {
    swaggerOptions: {
      defaultModelRendering: 'model',
      tryItOutEnabled: true,
      syntaxHighlight: {
        activate: true,
      },
    },
  });

  await app.listen(PORT);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  console.log(
    '--- Live Console Active. Type "gentoken <userId>" to generate a JWT ---'
  );
  console.log('--- Type "revoketoken <token>" to revoke a JWT ---');
  console.log(
    '--- Type downloadfiles to populate server downloads from github ---'
  );
  rl.on('line', (line) => {
    handleCommand(line).catch((err) =>
      console.error('Console Command Error:', err)
    );
  });

  async function handleCommand(line: string) {
    const [command, ...args] = line.trim().split(' ');

    if (command === 'gentoken') {
      const [sub, ...permissions] = args;
      const authService = app.get(AuthService);
      const token = await authService.createToken();
      console.log(`\nToken generated for: ${sub}`);
      console.log(`Permissions: [${permissions.join(', ') || 'none'}]`);
      console.log(`Result: ${token.access_token}\n`);
    } else if (command === 'revoketoken') {
      const [token] = args;
      if (!args) {
        console.log('Usage: revoketoken <token>');
      }
      const authService = app.get(AuthService);
      const res = await authService.revokeToken(token);

      if (res) {
        console.log('successfully revoked token');
      }
    } else if (command === 'downloadfiles') {
      const manifestService = app.get(ManifestService);
      const res = manifestService.downloadFilesFromManifest();
      console.log(res);
    } else if (command === 'status') {
      console.log('Server is healthy and running on port 3000');
    } else if (command === 'genintegrity') {
      const integrityService = app.get(IntegrityService);
      integrityService.generateChecksumForAllReleases();
    } else if (command == 'genzipintegrity') {
      const integrityService = app.get(IntegrityService);
      await integrityService.generateChecksumForAllZipFiles();
    } else {
      console.log('Invalid command');
      console.log(
        '--- Live Console Active. Type "gentoken <userId>" to generate a JWT ---'
      );
      console.log('--- Type "revoketoken <token>" to revoke a JWT ---');
      console.log(
        '--- Type downloadfiles to populate server downloads from github ---'
      );
    }
  }
}
bootstrap().catch(console.error);
