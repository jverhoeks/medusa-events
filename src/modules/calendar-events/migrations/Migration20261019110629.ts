import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261019110629 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "calendar_event" ("id" text not null, "title" text not null, "title_en" text null, "description" text null, "description_en" text null, "venue" text null, "city" text null, "address" text null, "starts_at" timestamptz null, "ends_at" timestamptz null, "time_zone" text not null default 'Europe/Amsterdam', "external_url" text null, "is_published" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "calendar_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_calendar_event_deleted_at" ON "calendar_event" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "calendar_event" cascade;`);
  }

}
