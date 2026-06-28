import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  const { user } = session;

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      banner: user.banner,
      bio: user.bio,
      postCount: user.postCount,
      isMuted: user.isMuted,
      isBanned: user.isBanned,
      createdAt: user.createdAt,
    },
  });
}
