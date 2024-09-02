CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text NOT NULL,
	`slug` text DEFAULT '' NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`username` text NOT NULL,
	`username_set` integer DEFAULT false NOT NULL,
	`user_created` integer DEFAULT (current_timestamp) NOT NULL,
	`linked_google` integer DEFAULT false NOT NULL,
	`linked_twitch` integer DEFAULT false NOT NULL,
	`linked_discord` integer DEFAULT false NOT NULL,
	`linked` integer DEFAULT false,
	`loadout` text DEFAULT '{"outfit":"outfitBase","melee":"fists","heal":"heal_basic","boost":"boost_basic","player_icon":"","crosshair":{"type":"crosshair_default","color":16777215,"size":"1.00","stroke":"0.00"},"emotes":["emote_happyface","emote_thumbsup","emote_surviv","emote_sadface","",""]}' NOT NULL
);
