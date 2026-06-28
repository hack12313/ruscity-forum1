import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", [
  "admin",
  "moderator",
  "helper",
  "vip",
  "user",
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 80 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("user"),
  avatar: text("avatar"),
  banner: text("banner"),
  bio: text("bio"),
  isMuted: boolean("is_muted").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  mutedUntil: timestamp("muted_until"),
  muteReason: text("mute_reason"),
  banReason: text("ban_reason"),
  postCount: integer("post_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Categories table (разделы)
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("📁"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Subforums table (подразделы)
export const subforums = pgTable("subforums", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("💬"),
  sortOrder: integer("sort_order").notNull().default(0),
  isLocked: boolean("is_locked").notNull().default(false),
  topicCount: integer("topic_count").notNull().default(0),
  postCount: integer("post_count").notNull().default(0),
  lastPostId: integer("last_post_id"),
  lastPostAt: timestamp("last_post_at"),
  lastPostUserId: integer("last_post_user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Topics table (темы)
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  subforumId: integer("subforum_id")
    .notNull()
    .references(() => subforums.id, { onDelete: "cascade" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  replyCount: integer("reply_count").notNull().default(0),
  lastPostId: integer("last_post_id"),
  lastPostAt: timestamp("last_post_at"),
  lastPostUserId: integer("last_post_user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Posts table (сообщения)
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").notNull().default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sessions table
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
