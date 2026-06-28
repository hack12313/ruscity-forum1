import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { user } = session;
    const body = await req.json();
    const { displayName, bio, avatar, banner } = body;

    const updateData: Partial<{
      displayName: string;
      bio: string;
      avatar: string;
      banner: string;
      updatedAt: Date;
    }> = { updatedAt: new Date() };

    if (displayName !== undefined) {
      if (displayName.length < 1 || displayName.length > 80) {
        return NextResponse.json(
          { error: "Никнейм должен быть от 1 до 80 символов" },
          { status: 400 }
        );
      }
      updateData.displayName = displayName;
    }

    if (bio !== undefined) {
      updateData.bio = bio.slice(0, 500);
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (banner !== undefined) {
      updateData.banner = banner;
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        displayName: updated.displayName,
        bio: updated.bio,
        avatar: updated.avatar,
        banner: updated.banner,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
