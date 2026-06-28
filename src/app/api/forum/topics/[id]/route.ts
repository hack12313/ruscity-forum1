import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { topics, posts, users, subforums } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const topicId = parseInt(id);

    const topicResult = await db
      .select()
      .from(topics)
      .where(eq(topics.id, topicId))
      .limit(1);

    const topic = topicResult[0];
    if (!topic) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    // Increment view count
    await db
      .update(topics)
      .set({ viewCount: sql`${topics.viewCount} + 1` })
      .where(eq(topics.id, topicId));

    // Get subforum
    const subResult = await db
      .select()
      .from(subforums)
      .where(eq(subforums.id, topic.subforumId))
      .limit(1);

    // Get posts
    const postsList = await db
      .select()
      .from(posts)
      .where(eq(posts.topicId, topicId))
      .orderBy(asc(posts.createdAt));

    // Get authors
    const authorIds = [...new Set(postsList.map((p) => p.authorId))];
    const authorsMap: Record<
      number,
      {
        id: number;
        username: string;
        displayName: string | null;
        avatar: string | null;
        role: string;
        postCount: number;
        createdAt: Date;
      }
    > = {};

    for (const uid of authorIds) {
      const u = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
          role: users.role,
          postCount: users.postCount,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, uid))
        .limit(1);
      if (u[0]) {
        authorsMap[uid] = u[0];
      }
    }

    const enrichedPosts = postsList.map((p) => ({
      ...p,
      author: authorsMap[p.authorId] || null,
    }));

    // Get topic author
    const topicAuthor = authorsMap[topic.authorId] || null;

    return NextResponse.json({
      topic: { ...topic, author: topicAuthor },
      subforum: subResult[0] || null,
      posts: enrichedPosts,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { user } = session;
    const { id } = await params;
    const topicId = parseInt(id);
    const body = await req.json();

    const topicResult = await db
      .select()
      .from(topics)
      .where(eq(topics.id, topicId))
      .limit(1);

    const topic = topicResult[0];
    if (!topic) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    const isAdmin = user.role === "admin" || user.role === "moderator";
    if (!isAdmin) {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    await db
      .update(topics)
      .set({
        isPinned: body.isPinned !== undefined ? body.isPinned : topic.isPinned,
        isLocked: body.isLocked !== undefined ? body.isLocked : topic.isLocked,
      })
      .where(eq(topics.id, topicId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
