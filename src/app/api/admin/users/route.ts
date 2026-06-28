import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ilike, or, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { user } = session;
    if (user.role !== "admin" && user.role !== "moderator") {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    const search = req.nextUrl.searchParams.get("search") || "";

    let query;
    if (search) {
      query = db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          email: users.email,
          role: users.role,
          avatar: users.avatar,
          isMuted: users.isMuted,
          isBanned: users.isBanned,
          mutedUntil: users.mutedUntil,
          muteReason: users.muteReason,
          banReason: users.banReason,
          postCount: users.postCount,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(or(ilike(users.username, `%${search}%`), ilike(users.email, `%${search}%`)))
        .orderBy(desc(users.createdAt))
        .limit(50);
    } else {
      query = db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          email: users.email,
          role: users.role,
          avatar: users.avatar,
          isMuted: users.isMuted,
          isBanned: users.isBanned,
          mutedUntil: users.mutedUntil,
          muteReason: users.muteReason,
          banReason: users.banReason,
          postCount: users.postCount,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(50);
    }

    const usersList = await query;
    return NextResponse.json({ users: usersList });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
