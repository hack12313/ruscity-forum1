import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, subforums, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  try {
    await seedDatabase();

    const cats = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder));

    const subs = await db
      .select({
        id: subforums.id,
        categoryId: subforums.categoryId,
        name: subforums.name,
        description: subforums.description,
        icon: subforums.icon,
        sortOrder: subforums.sortOrder,
        isLocked: subforums.isLocked,
        topicCount: subforums.topicCount,
        postCount: subforums.postCount,
        lastPostAt: subforums.lastPostAt,
        lastPostUserId: subforums.lastPostUserId,
      })
      .from(subforums)
      .orderBy(asc(subforums.sortOrder));

    // Get last post usernames
    const userIds = [
      ...new Set(
        subs
          .filter((s) => s.lastPostUserId !== null)
          .map((s) => s.lastPostUserId as number)
      ),
    ];

    const lastPostUsers: Record<number, string> = {};
    if (userIds.length > 0) {
      for (const uid of userIds) {
        const u = await db
          .select({ id: users.id, username: users.username, displayName: users.displayName })
          .from(users)
          .where(eq(users.id, uid))
          .limit(1);
        if (u[0]) {
          lastPostUsers[uid] = u[0].displayName || u[0].username;
        }
      }
    }

    const result = cats.map((cat) => ({
      ...cat,
      subforums: subs
        .filter((s) => s.categoryId === cat.id)
        .map((s) => ({
          ...s,
          lastPostUsername: s.lastPostUserId
            ? lastPostUsers[s.lastPostUserId]
            : null,
        })),
    }));

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error("Categories error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
