import { cookies } from "next/headers";

export function getTokenFromCookie() {
  const cookieData = cookies().get("PRISMA-MINIO-TOKEN");
  if (!cookieData) return null;
  return cookieData.value;
}
