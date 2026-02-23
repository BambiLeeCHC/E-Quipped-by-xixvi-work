CREATE TABLE `access_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending',
	`message` text,
	`reviewedBy` int,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `access_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`passed` boolean NOT NULL DEFAULT false,
	`answers` json NOT NULL,
	`attemptedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`question` text NOT NULL,
	`options` json NOT NULL,
	`correctIndex` int NOT NULL,
	`explanation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
