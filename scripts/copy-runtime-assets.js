import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'public', 'runtime');
const copy = async (source, destination) => {
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
};

await rm(publicRoot, { recursive: true, force: true });
await copy(path.join(root, 'node_modules/tesseract.js/dist/worker.min.js'), path.join(publicRoot, 'tesseract/worker.min.js'));
await copy(path.join(root, 'node_modules/tesseract.js-core'), path.join(publicRoot, 'tesseract-core'));
for (const language of ['chi_sim', 'eng']) {
  await copy(
    path.join(root, `node_modules/@tesseract.js-data/${language}/4.0.0/${language}.traineddata.gz`),
    path.join(publicRoot, `lang-data/${language}.traineddata.gz`),
  );
}

console.log('Tesseract worker、核心和中英文识别模型已复制到 public/runtime。');
