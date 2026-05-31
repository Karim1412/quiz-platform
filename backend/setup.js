/**
 * QuizCraft Backend Setup Script
 * Run: node setup.js
 *
 * This script:
 * 1. Copies .env.example → .env (if .env doesn't exist)
 * 2. Prints next steps clearly
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env");
const examplePath = path.join(__dirname, ".env.example");

console.log("\n🎓  QuizCraft Backend Setup\n");

if (fs.existsSync(envPath)) {
  console.log("✅  .env already exists — skipping copy.");
} else {
  fs.copyFileSync(examplePath, envPath);
  console.log("✅  Created .env from .env.example");
}

