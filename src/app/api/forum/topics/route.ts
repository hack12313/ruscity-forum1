import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { topics, posts, subforums, users } from "@/db/schema";
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
      return NextResponse.json({ error: "Вы не можете создавать темы (мут)" }, { status: 403 });
    }

    const body = await req.json();
    const { subforumId, title, content } = body;

    if (!subforumId || !title || !content) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    if (title.trim().length < 3) {
      return NextResponse.json({ error: "Название темы слишком короткое" }, { status: 400 });
    }

    // Check subforum exists
    const subResult = await db
      .select()
      .from(subforums)
      .where(eq(subforums.id, subforumId))
      .limit(1);

    if (!subResult[0]) {
      return NextResponse.json({ error: "Подраздел не найден" }, { status: 404 });
    }

    if (subResult[0].isLocked && user.role === "user") {
      return NextResponse.json({ error: "Подраздел закрыт для новых тем" }, { status: 403 });
    }

    const now = new Date();

    const [newTopic] = await db
      .insert(topics)
      .values({
        subforumId,
        authorId: user.id,
        title: title.trim(),
        lastPostAt: now,
        lastPostUserId: user.id,
      })
      .returning();

    const [newPost] = await db
      .insert(posts)
      .values({
        topicId: newTopic.id,
        authorId: user.id,
        content: content.trim(),
      })
      .returning();

    // Update topic with lastPostId
    await db
      .update(topics)
      .set({ lastPostId: newPost.id })
      .where(eq(topics.id, newTopic.id));

    // Update subforum stats
    await db
      .update(subforums)
      .set({
        topicCount: sql`${subforums.topicCount} + 1`,
        postCount: sql`${subforums.postCount} + 1`,
        lastPostId: newPost.id,
        lastPostAt: now,
        lastPostUserId: user.id,
      })
      .where(eq(subforums.id, subforumId));

    // Update user post count
    await db
      .update(users)
      .set({ postCount: sql`${users.postCount} + 1` })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, topicId: newTopic.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
