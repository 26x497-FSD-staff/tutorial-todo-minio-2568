import * as jwt from "jsonwebtoken";

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      username: string;
    };
    return decoded.username;
  } catch (err) {
    return null;
  }
}
