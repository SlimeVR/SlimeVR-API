import { Module } from '@nestjs/common';
import { DATABASE_URL } from './env';
import { DatabaseModule } from './db/db.module';
import { Controllers } from './controllers';
import { Services } from './services';
import { ConfigModule } from '@nestjs/config';

console.log('DATABASE_URL:', DATABASE_URL);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.register(DATABASE_URL),
  ],
  controllers: [...Controllers],
  providers: [...Services],
})
export class AppModule {}
