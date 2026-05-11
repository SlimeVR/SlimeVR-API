import { Module } from '@nestjs/common';
import { DATABASE_URL } from './env';
import { DatabaseModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { UpdaterModule } from './updater/updater.module';

console.log('DATABASE_URL:', DATABASE_URL);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.register(DATABASE_URL),
    UpdaterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
