import { DatabaseService } from './db.service';
import { DynamicModule, Global, Module } from '@nestjs/common';

@Global()
@Module({})
export class DatabaseModule {
  static register(url: string): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'URL',
          useValue: url,
        },
        DatabaseService,
      ],
      exports: [DatabaseService, 'URL'],
    };
  }
}
