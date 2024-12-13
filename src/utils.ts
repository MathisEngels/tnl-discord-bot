import path from "path";

export function getPublicPath() {
  if (process.env.NODE_ENV === "production") {
    return __dirname;
  } else {
    return path.join(__dirname, "../public");
  }
}