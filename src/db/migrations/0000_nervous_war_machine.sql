CREATE TABLE `journeys` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`cover_media_id` text,
	`color` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`is_favorite` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`cover_media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `journeys_start_date_idx` ON `journeys` (`start_date`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`stop_id` text NOT NULL,
	`type` text NOT NULL,
	`file_path` text NOT NULL,
	`thumbnail_path` text,
	`width` integer,
	`height` integer,
	`duration_ms` integer,
	`taken_at` integer,
	`latitude` real,
	`longitude` real,
	`source_asset_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`stop_id`) REFERENCES `stops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `media_stop_idx` ON `media` (`stop_id`,`sort_order`);--> statement-breakpoint
CREATE UNIQUE INDEX `media_source_asset_uq` ON `media` (`source_asset_id`);--> statement-breakpoint
CREATE TABLE `places` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`locality` text,
	`admin_area` text,
	`country_code` text,
	`country_name` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`source` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `places_region_idx` ON `places` (`country_code`,`admin_area`);--> statement-breakpoint
CREATE INDEX `places_coords_idx` ON `places` (`latitude`,`longitude`);--> statement-breakpoint
CREATE TABLE `stops` (
	`id` text PRIMARY KEY NOT NULL,
	`journey_id` text NOT NULL,
	`place_id` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`title` text NOT NULL,
	`note` text,
	`mood` text,
	`visited_at` integer NOT NULL,
	`order_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `stops_journey_order_idx` ON `stops` (`journey_id`,`order_index`);--> statement-breakpoint
CREATE INDEX `stops_visited_at_idx` ON `stops` (`visited_at`);--> statement-breakpoint
CREATE INDEX `stops_place_idx` ON `stops` (`place_id`);--> statement-breakpoint
CREATE TABLE `wishlist` (
	`id` text PRIMARY KEY NOT NULL,
	`place_id` text NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlist_place_id_unique` ON `wishlist` (`place_id`);