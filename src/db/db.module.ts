import { DatabaseService } from './db.service';
import { DynamicModule, Module } from '@nestjs/common';

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
      exports: [DatabaseService],
    };
  }
}
