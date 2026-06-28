import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, posts, topics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const result = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        role: users.role,
        avatar: users.avatar,
        banner: users.banner,
        bio: users.bio,
        postCount: users.postCount,
        isMuted: users.isMuted,
        isBanned: users.isBanned,
        mutedUntil: users.mutedUntil,
        muteReason: users.muteReason,
        banReason: users.banReason,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    const user = result[0];
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    // Get recent posts
    const recentPosts = await db
      .select({
        id: posts.id,
        topicId: posts.topicId,
        content: posts.content,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.authorId, user.id))
      .orderBy(posts.createdAt)
      .limit(5);

    return NextResponse.json({ user, recentPosts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
