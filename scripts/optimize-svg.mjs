import { readFileSync, writeFileSync } from "fs";
import { readdir } from "fs/promises";
import { join } from "path";
import { optimize } from "svgo";

/**
 * SVGファイルを最適化するスクリプト
 * SVGOを使用してSVGファイルのサイズを削減
 */

const SVG_DIR = "src/assets/svg";
const BACKUP_DIR = "src/assets/svg/backup";

// SVGOの設定（最大限の最適化）
const svgoConfig = {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // viewBoxは保持（レスポンシブ対応のため）
          removeViewBox: false,
        },
      },
    },
    // ラスター画像を削除（base64エンコードされたPNG画像を削除）
    {
      name: "removeRasterImages",
      active: true,
    },
  ],
};

async function optimizeSvgFiles() {
  try {
    const files = await readdir(SVG_DIR);
    const svgFiles = files.filter((file) => file.endsWith(".svg"));

    if (svgFiles.length === 0) {
      console.log("⚠️  SVGファイルが見つかりませんでした");
      return;
    }

    console.log(`\n📦 ${svgFiles.length}個のSVGファイルを最適化します...\n`);

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const file of svgFiles) {
      const filePath = join(SVG_DIR, file);
      const originalContent = readFileSync(filePath, "utf8");
      const originalSize = Buffer.byteLength(originalContent, "utf8");

      try {
        const result = optimize(originalContent, svgoConfig);
        const optimizedSize = Buffer.byteLength(result.data, "utf8");
        const reduction = originalSize - optimizedSize;
        const reductionPercent = ((reduction / originalSize) * 100).toFixed(1);

        // 最適化後のファイルを書き込み
        writeFileSync(filePath, result.data, "utf8");

        totalOriginalSize += originalSize;
        totalOptimizedSize += optimizedSize;

        console.log(`✅ ${file}`);
        console.log(`   元のサイズ: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`   最適化後: ${(optimizedSize / 1024).toFixed(2)} KB`);
        console.log(`   削減: ${(reduction / 1024).toFixed(2)} KB (${reductionPercent}%)\n`);
      } catch (error) {
        console.error(`❌ ${file} の最適化に失敗しました:`, error.message);
      }
    }

    const totalReduction = totalOriginalSize - totalOptimizedSize;
    const totalReductionPercent = ((totalReduction / totalOriginalSize) * 100).toFixed(1);

    console.log("\n" + "=".repeat(50));
    console.log("📊 最適化結果サマリー");
    console.log("=".repeat(50));
    console.log(`合計元のサイズ: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
    console.log(`合計最適化後: ${(totalOptimizedSize / 1024).toFixed(2)} KB`);
    console.log(`合計削減: ${(totalReduction / 1024).toFixed(2)} KB (${totalReductionPercent}%)\n`);
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

optimizeSvgFiles();
