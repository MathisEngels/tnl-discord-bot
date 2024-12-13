import path from "path";

export function getPublicPath() {
  if (process.env.NODE_ENV === "production") {
    return "";
  } else {
    return path.join(__dirname, "../public");
  }
}