import { getImages } from "../middleware/getImages.middleware.ts";

async function main() {
  console.log("[UpdateImages] 开始更新图片...");
  await getImages();
  console.log("[UpdateImages] 图片更新完成");
}

main(); 