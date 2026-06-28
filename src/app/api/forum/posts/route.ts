import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, topics, subforums, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { user } = session;

    if (user.isBanned) {
      return NextResponse.json({ error: "Ваш аккаунт заблокирован" }, { status: 403 });
    }

    if (user.isMuted) {
      return NextResponse.json({ error: "Вы не можете отвечать (мут)" }, { status: 403 });
    }

    const body = await req.json();
    const { topicId, content } = body;

    if (!topicId || !content) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    const topicResult = await db
      .select()
      .from(topics)
      .where(eq(topics.id, topicId))
      .limit(1);

    const topic = topicResult[0];
    if (!topic) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    if (topic.isLocked && user.role === "user") {
      return NextResponse.json({ error: "Тема закрыта" }, { status: 403 });
    }

    const now = new Date();

    const [newPost] = await db
      .insert(posts)
      .values({
        topicId,
        authorId: user.id,
        content: content.trim(),
      })
      .returning();

    // Update topic
    await db
      .update(topics)
      .set({
        replyCount: sql`${topics.replyCount} + 1`,
        lastPostId: newPost.id,
        lastPostAt: now,
        lastPostUserId: user.id,
        updatedAt: now,
      })
      .where(eq(topics.id, topicId));

    // Update subforum
    await db
      .update(subforums)
      .set({
        postCount: sql`${subforums.postCount} + 1`,
        lastPostId: newPost.id,
        lastPostAt: now,
        lastPostUserId: user.id,
      })
      .where(eq(subforums.id, topic.subforumId));

    // Update user post count
    await db
      .update(users)
      .set({ postCount: sql`${users.postCount} + 1` })
      .where(eq(users.id, user.id));

    const authorData = await db
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
      .where(eq(users.id, user.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      post: { ...newPost, author: authorData[0] || null },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
