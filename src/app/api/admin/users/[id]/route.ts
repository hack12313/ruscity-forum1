import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { user: currentUser } = session;
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    const { id } = await params;
    const targetId = parseInt(id);
    const body = await req.json();

    // Fetch target user
    const targetResult = await db
      .select()
      .from(users)
      .where(eq(users.id, targetId))
      .limit(1);

    const targetUser = targetResult[0];
    if (!targetUser) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    // Prevent modifying admins unless you're admin
    if (targetUser.role === "admin" && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Нельзя изменять администраторов" }, { status: 403 });
    }

    // Prevent self-ban
    if (targetId === currentUser.id && (body.isBanned || body.isMuted)) {
      return NextResponse.json({ error: "Нельзя забанить/замутить себя" }, { status: 400 });
    }

    const updateData: Partial<{
      isMuted: boolean;
      isBanned: boolean;
      mutedUntil: Date | null;
      muteReason: string | null;
      banReason: string | null;
      role: "admin" | "moderator" | "helper" | "vip" | "user";
    }> = {};

    if (body.action === "mute") {
      updateData.isMuted = true;
      updateData.muteReason = body.reason || null;
      if (body.duration) {
        const until = new Date(Date.now() + body.duration * 60 * 1000);
        updateData.mutedUntil = until;
      } else {
        updateData.mutedUntil = null;
      }
    } else if (body.action === "unmute") {
      updateData.isMuted = false;
      updateData.mutedUntil = null;
      updateData.muteReason = null;
    } else if (body.action === "ban") {
      updateData.isBanned = true;
      updateData.banReason = body.reason || null;
    } else if (body.action === "unban") {
      updateData.isBanned = false;
      updateData.banReason = null;
    } else if (body.action === "setRole") {
      if (currentUser.role !== "admin") {
        return NextResponse.json({ error: "Только администратор может менять роли" }, { status: 403 });
      }
      const validRoles = ["admin", "moderator", "helper", "vip", "user"] as const;
      if (!validRoles.includes(body.role)) {
        return NextResponse.json({ error: "Недопустимая роль" }, { status: 400 });
      }
      updateData.role = body.role;
    } else {
      return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, targetId))
      .returning();

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        isMuted: updated.isMuted,
        isBanned: updated.isBanned,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
