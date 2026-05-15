import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../db/db.service';
import * as Schema from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    private dbService: DatabaseService,
    private jwtService: JwtService
  ) {}

  async createToken(sub: string = '', permissions: [] = []) {
    const payload = { sub: sub, permissions: permissions };

    const access_token = await this.jwtService.signAsync(payload);

    const [res] = await this.dbService.db
      .insert(Schema.Blocklist)
      .values({ access_token: access_token })
      .returning();
    return res;
  }

  async revokeToken(token: string) {
    const res = await this.dbService.db
      .update(Schema.Blocklist)
      .set({ isBlocked: true })
      .where(eq(Schema.Blocklist.access_token, token));

    return res;
  }
}
