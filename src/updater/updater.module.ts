import { Module } from '@nestjs/common';
import { Controllers } from './controllers';
import { Services } from './services';
import { DatabaseModule } from '../db/db.module';

@Module({
  imports: [DatabaseModule],
  controllers: [...Controllers],
  providers: [...Services],
  exports: [...Services],
})
export class UpdaterModule {}
