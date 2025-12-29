import { db } from "@/lib/server/db/prisma";
import { User } from "@prisma/client";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  ImageUrl: string | null;
  dateOfBirth: Date | null;
  role: string;
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  var user = await db.user.findUnique({
    where: { id },
  });
  var userProfile = await db.profile.findUnique({
    where: { userId: id },
  });
  if (!user || !userProfile) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    ImageUrl: user.image,
    role: user.role,
    dateOfBirth: userProfile.dateOfBirth,
    phone: user.phoneNumber,
  };
}
