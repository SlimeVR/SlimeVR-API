import { defineRelations } from 'drizzle-orm';
import {
  pgTable,
  text,
  boolean,
  integer,
  jsonb,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const Channel = pgTable('channels', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  description: text().notNull(),
  defaultChannel: boolean().default(false).notNull(),
});

export const Version = pgTable('version', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  semver: text().notNull(),
  minDriverVersion: text().notNull().default(''),
  changelog: text().notNull(),
  channelId: integer('channel_id')
    .notNull()
    .references(() => Channel.id),
});

export const Release = pgTable('release', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  platform: text().notNull(),
  architecture: text().notNull(),
  url: text().notNull(),
  checksum: text().notNull(),
  run: jsonb('run').notNull().default([]),
  versionId: integer('version_id')
    .notNull()
    .references(() => Version.id),
});

export const Blocklist = pgTable('tokens', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  access_token: varchar().notNull(),
  isBlocked: boolean().default(false).notNull(),
});

export const ApiKey = pgTable('apiKey', {
  id: uuid('id').primaryKey().defaultRandom(),
  owner: text().notNull(),
  apiKey: varchar('api_key').notNull(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const relations = defineRelations({ Version, Channel, Release }, (r) => ({
  Channel: {
    versions: r.many.Version(),
  },
  Version: {
    channel: r.one.Channel({
      from: r.Version.channelId,
      to: r.Channel.id,
    }),
    releases: r.many.Release(),
  },
  Release: {
    version: r.one.Version({
      from: r.Release.versionId,
      to: r.Version.id,
    }),
  },
}));
