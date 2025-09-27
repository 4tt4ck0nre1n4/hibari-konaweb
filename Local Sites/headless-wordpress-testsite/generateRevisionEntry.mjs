import fs, { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const formattedDate = `${year}年${month}月${day}日`;
const formattedPath = `${year}-${month}-${day}`;
const routePath = `../../privacy/${formattedPath}`;

const jsonPath = path.join(__dirname, "./src/data/revisionDates.json");

if (!fs.existsSync(jsonPath)) {
  fs.writeFileSync(jsonPath, JSON.stringify([], null, 2));
}

const currentDate = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

const alreadyExists = currentDate.some((entry) => entry.path === routePath);

if (!alreadyExists) {
  currentDate.unshift({
    data: formattedDate,
    path: routePath
  });

  fs.writeFileSync(jsonPath, JSON.stringify(currentDate, null, 2));
  console.log("改定日を追加しました:", formattedDate);

} else {
  console.log("すでに登録済みです:", formattedDate);
}

const targetFile = path.join(__dirname, `src/pages/privacy/${formattedPath}.astro`);

if (!fs.existsSync(targetFile)) {
  const content = `
  ---
  import Layout from "../../layouts/Layout.astro";
  import Header from "../../components/Header.astro";
  import Footer from "../../components/Footer.astro";
  import { generateBreadcrumbs } from "../../util/generateBreadcrumbs";
  import Breadcrumbs from "../../components/Breadcrumbs.astro";

  interface Props {
    privacyTitle: string;
  }

  const privacyTitle = "プライバシーポリシー";
  const crumbs = generateBreadcrumbs(Astro.url.pathname);
  ---

  <Layout
    title="{privacyTitle} (改定日 &#0058; ${formattedDate})"
    description="当サイトのプライバシーポリシーの改定内容を掲載しています。"
    ogType="article"
    ogTitle="プライバシーポリシー (改定日 &#0058; ${formattedDate})"
    ogDescription="当サイトのプライバシーポリシーの改定内容を掲載しています。"
    twitterTitle="プライバシーポリシー (改定日 &#0058; ${formattedDate})"
    twitterDescription="当サイトのプライバシーポリシーの改定内容を掲載しています。"
  >
    <div id="outer-container">
      <Header />
      <main id="page-wrap">
        <div class="breadcrumbs__wrapper">
          <Breadcrumbs {crumbs} />
        </div>
        <div class="privacy__wrapper">
          <h1 class="privacy__title">
            プライバシーポリシー (改定日 &#0058;
            <time datetime=${formattedPath}>
             ${formattedDate}
            </time>
            )
          </h1>
          <p class="privacy__text">
            当サイトのプライバシーポリシー (改定日 &#0058; ${formattedDate})の改定内容は下記の通りです。
          </p>
          <p class="privacy__text"></p>
        </div>
      </main>
      <Footer />
    </div>
  </Layout>`;

  fs.writeFileSync(targetFile, content);
  console.log(`ファイルを作成しました。 : ${targetFile}`);

} else {
  console.log(`ファイルはすでに存在しています。 : ${targetFile}`);
}
