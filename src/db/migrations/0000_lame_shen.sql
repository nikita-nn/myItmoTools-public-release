CREATE TABLE IF NOT EXISTS `nodes` (
	`id` text,
	`url` text NOT NULL,
	`name` text NOT NULL,
	`ping` integer DEFAULT 0 NOT NULL,
	`selected` text DEFAULT 'false'
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `nodes_name_unique` ON `nodes` (`name`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `PESettings` (
	`id` integer DEFAULT 1,
	`name` text,
	`taskId` integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `system` (
	`id` text DEFAULT '1' NOT NULL,
	`node` text DEFAULT 'Boromir' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`isu_id` text PRIMARY KEY NOT NULL,
	`password` text NOT NULL,
	`refresh_token` text NOT NULL,
	`access_token` text NOT NULL,
	`selected` text DEFAULT 'false',
	`timeToUpdate` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_isu_id_unique` ON `users` (`isu_id`);