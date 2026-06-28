import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subforums, topics, users } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subforumId = parseInt(id);

    const subResult = await db
      .select()
      .from(subforums)
      .where(eq(subforums.id, subforumId))
      .limit(1);

    const subforum = subResult[0];
    if (!subforum) {
      return NextResponse.json({ error: "Подраздел не найден" }, { status: 404 });
    }

    const topicsList = await db
      .select({
        id: topics.id,
        title: topics.title,
        isPinned: topics.isPinned,
        isLocked: topics.isLocked,
        viewCount: topics.viewCount,
        replyCount: topics.replyCount,
        createdAt: topics.createdAt,
        lastPostAt: topics.lastPostAt,
        lastPostUserId: topics.lastPostUserId,
        authorId: topics.authorId,
      })
      .from(topics)
      .where(eq(topics.subforumId, subforumId))
      .orderBy(desc(topics.isPinned), desc(topics.lastPostAt));

    // Get authors
    const authorIds = [
      ...new Set([
        ...topicsList.map((t) => t.authorId),
        ...topicsList
          .filter((t) => t.lastPostUserId)
          .map((t) => t.lastPostUserId as number),
      ]),
    ];

    const authorsMap: Record<number, { username: string; displayName: string | null; avatar: string | null }> = {};
    for (const uid of authorIds) {
      const u = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
        })
        .from(users)
        .where(eq(users.id, uid))
        .limit(1);
      if (u[0]) {
        authorsMap[uid] = u[0];
      }
    }

    const enrichedTopics = topicsList.map((t) => ({
      ...t,
      author: authorsMap[t.authorId] || null,
      lastPostUser: t.lastPostUserId ? authorsMap[t.lastPostUserId] || null : null,
    }));

    return NextResponse.json({ subforum, topics: enrichedTopics });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
