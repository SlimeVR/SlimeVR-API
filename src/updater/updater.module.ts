import { Module } from '@nestjs/common';
import { Controllers } from './controllers';
import { Services } from './services';
import { DatabaseModule } from '../db/db.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [...Controllers],
  providers: [
    ...Services,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [...Services],
})
export class UpdaterModule {}
