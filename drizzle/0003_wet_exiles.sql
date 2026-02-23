CREATE TABLE `sandbox_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`qualityScore` int,
	`qualityFeedback` text,
	`qualityPassed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sandbox_messages_id` PRIMARY KEY(`id`)
);
