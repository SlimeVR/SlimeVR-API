import { Module } from '@nestjs/common';
import { DATABASE_URL } from './env';
import * as schema from './db/schema';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import { Controllers } from './controllers';
import { Services } from './services';

@Module({
  imports: [
    DrizzlePostgresModule.register({
      tag: 'DB',
      postgres: { url: DATABASE_URL },
      config: { schema: { ...schema } },
    }),
  ],
  controllers: [...Controllers],
  providers: [...Services],
})
export class AppModule {}
