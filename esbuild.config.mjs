import esbuild from "esbuild";
import { readFileSync, writeFileSync, copyFileSync, existsSync, cpSync } from "fs";

const isProd = process.argv.includes("production");

esbuild.build({
  entryPoints: ["main.ts"],
  bundle: true,
  external: ["obsidian"],
  outfile: "main.js",
  format: "cjs",
  sourcemap: !isProd,
  minify: isProd,
  target: ["es2020"],
  logLevel: "info",
  platform: "browser"
}).then(() => {
  // Ensure manifest.json is in root (required by Obsidian)
  // and styles.css placeholder exists if needed.
  try {
    // no-op: files already at root in this template
  } catch (e) {
    console.error(e);
  }
});


// Ensure NOTICE, LICENSE, README.md are present at repo root for distribution
const rootFiles = ["NOTICE", "LICENSE", "README.md"];
for (const f of rootFiles) {
  if (existsSync(f)) {
    // File already at root; ensure it’s available post-build (no-op copy to itself is harmless on most systems)
    try {
      cpSync(f, f);
    } catch {
      // ignore
    }
  }
}