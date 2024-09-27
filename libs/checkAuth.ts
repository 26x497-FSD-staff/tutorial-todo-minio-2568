import { getTokenFromCookie } from "./getTokenFromCookie";
import { verifyToken } from "./verifyToken";

export function checkAuth() {
  const token = getTokenFromCookie();
  if (!token) {
    return null;
  }
  const username = verifyToken(token);
  if (!username) {
    return null;
  }
  return username;
}
