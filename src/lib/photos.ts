import fs from "fs";
import path from "path";

export function getFriendPhotos(): string[] {
  const friendsDir = path.join(process.cwd(), "public", "friends");
  try {
    const files = fs.readdirSync(friendsDir);
    return files
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .map((f) => `/friends/${f}`);
  } catch {
    return [];
  }
}
