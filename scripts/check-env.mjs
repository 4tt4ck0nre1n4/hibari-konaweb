#!/usr/bin/env node

/**
 * 環境変数チェックスクリプト
 * ビルド前に実行して、必要な環境変数が設定されているか確認します
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// .envファイルを読み込む
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "..", ".env");

config({ path: envPath });

console.log("🔍 環境変数チェックを開始します...\n");

let hasErrors = false;

// 必須の環境変数
const requiredEnvVars = [
  { name: "PUBLIC_API_URL", example: "http://hibari-konaweb.local" },
  { name: "PUBLIC_API_PREFIX", example: "/wp-json/wp/v2/", optional: true },
];

console.log("📋 必須環境変数の確認:");
console.log("─".repeat(60));

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar.name];

  if (!value) {
    if (envVar.optional) {
      console.log(`⚠️  ${envVar.name}: 未設定（オプション）`);
      console.log(`   デフォルト値が使用されます: ${envVar.example}`);
    } else {
      console.log(`❌ ${envVar.name}: 未設定`);
      console.log(`   例: ${envVar.example}`);
      hasErrors = true;
    }
  } else {
    // ローカルURLの警告
    if (value.includes("localhost") || value.includes("127.0.0.1") || value.includes(".local")) {
      console.log(`⚠️  ${envVar.name}: ${value}`);
      console.log(`   注意: この URL は「そのマシンから HTTP で届く」必要があります。`);
      console.log(`   Local WP が起動しない・使えない場合は、本番の WordPress URL（https://…）に変更してください。`);
      console.log(`   （Netlify 本番ビルドでは必ず公開 URL を設定してください）`);
    } else {
      console.log(`✅ ${envVar.name}: ${value}`);
    }
  }
  console.log("");
}

console.log("─".repeat(60));

if (hasErrors) {
  console.log("\n❌ エラー: 必須の環境変数が設定されていません！\n");
  console.log("ローカル開発環境の場合:");
  console.log("  1. env.example.txt を .env にコピー");
  console.log("  2. .env ファイルを編集して適切な値を設定\n");
  console.log("Netlify本番環境の場合:");
  console.log("  1. Netlifyダッシュボードにログイン");
  console.log("  2. Site Settings → Environment Variables");
  console.log("  3. PUBLIC_API_URL を設定");
  console.log("  4. 再デプロイ\n");
  console.log("詳細は NETLIFY_ENV_SETUP.md を参照してください。\n");
  process.exit(1);
} else {
  console.log("\n✅ すべての環境変数が正しく設定されています！\n");

  // API接続テスト（オプション）
  const apiUrl = process.env.PUBLIC_API_URL;
  const apiPrefix = process.env.PUBLIC_API_PREFIX || "/wp-json/wp/v2/";

  console.log("🔗 API接続テスト:");
  console.log(`   URL: ${apiUrl}${apiPrefix}`);
  console.log("   ※ 実際のビルド時に接続が確認されます\n");

  process.exit(0);
}
