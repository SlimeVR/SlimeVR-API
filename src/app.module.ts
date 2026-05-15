import { Module } from '@nestjs/common';
import { DATABASE_URL } from './env';
import { DatabaseModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { UpdaterModule } from './updater/updater.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.register(DATABASE_URL),
    UpdaterModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
