import { Module } from '@nestjs/common';
import { Controllers } from './controllers';
import { Services } from './services';
import { DatabaseModule } from '../db/db.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DatabaseModule, HttpModule],
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
