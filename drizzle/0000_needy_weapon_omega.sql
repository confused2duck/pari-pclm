CREATE TABLE `pclm_files` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`uploader` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pclm_invitations` (
	`hash` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`member` text NOT NULL,
	`expires` integer NOT NULL,
	`used` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pclm_members` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`identity` text,
	`email` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pclm_member_identity` ON `pclm_members` (`identity`);--> statement-breakpoint
CREATE UNIQUE INDEX `pclm_member_email` ON `pclm_members` (`workspace`,`email`);--> statement-breakpoint
CREATE TABLE `pclm_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pclm_receipts` (
	`workspace` text NOT NULL,
	`id` text NOT NULL,
	`actor` text NOT NULL,
	`hash` text NOT NULL,
	`created` text NOT NULL,
	PRIMARY KEY(`workspace`, `id`)
);
--> statement-breakpoint
CREATE TABLE `pclm_records` (
	`workspace` text NOT NULL,
	`collection` text NOT NULL,
	`id` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`data` text NOT NULL,
	PRIMARY KEY(`workspace`, `collection`, `id`)
);
--> statement-breakpoint
CREATE TABLE `pclm_workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`metadata` text NOT NULL,
	`last_write` text
);
