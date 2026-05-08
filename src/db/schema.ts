import { defineRelations } from 'drizzle-orm';
import { pgTable, varchar, text, boolean, integer } from 'drizzle-orm/pg-core';

export const Channel = pgTable('channels', {
  id: varchar({ length: 42 }).primaryKey(),
  description: text(),
  defaultChannel: boolean(),
});

export const Version = pgTable('version', {
  id: varchar({ length: 42 }).primaryKey(),
  semvr: text(),
  changelog: text(),
  channelId: integer('channel_id'),
});

const relations = defineRelations({ Version, Channel }, (r) => ({
  Version: {
    channel: r.one.Channel({
      from: r.Version.channelId,
      to: r.Channel.id,
    }),
  },
  Channel: {
    versions: r.many.Version(),
  },
}));
