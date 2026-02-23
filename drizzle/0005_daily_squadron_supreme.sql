CREATE TABLE `stripe_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(64) NOT NULL,
	`stripeCustomerId` varchar(64),
	`amount` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'usd',
	`status` varchar(32) NOT NULL,
	`plan` enum('monthly','annual','lifetime'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stripe_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','trialing','past_due','canceled','unpaid');--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('monthly','annual','lifetime');--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPeriodEnd` timestamp;