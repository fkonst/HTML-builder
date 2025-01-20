const fs = require('fs');
const path = require('path');
const fsPromises = require('fs/promises');

const createFolder = async (pathFolder, nameFolder) => {
  const folderPath = path.join(pathFolder, nameFolder);
  await fsPromises.mkdir(folderPath, { recursive: true });
  return folderPath;
};

const createFile = (dist, fileName) => {
  const filePath = path.join(dist, fileName);
  const writeStream = fs.createWriteStream(filePath);
  return {
    path: filePath,
    stream: writeStream,
  };
};

const writeStyles = async (dist) => {
  const style = await createFile(dist, 'style.css');
  const stylesPath = path.join(__dirname, 'styles');
  const styles = await fsPromises
    .readdir(stylesPath, { withFileTypes: true })
    .then((files) =>
      files.filter(
        (file) => file.isFile() && path.extname(file.name) === '.css',
      ),
    );
  for (let file of styles) {
    const filePath = path.join(file.parentPath, file.name);
    const readStream = fs.createReadStream(filePath);
    readStream.on('data', (data) => style.stream.write(data));
  }
};

const copyAssets = async (dest, src = path.join(__dirname, 'assets')) => {
  const folderName = path.basename(src);
  const readSrc = await fsPromises.readdir(src, { withFileTypes: true });
  const createDestFolder = await createFolder(dest, folderName);
  for (let file of readSrc) {
    if (file.isDirectory()) {
      const currentPath = path.join(src, file.name);
      await copyAssets(createDestFolder, currentPath);
    } else if (file.isFile()) {
      const currentPath = path.join(src, file.name);
      const destPath = path.join(createDestFolder, file.name);
      await fsPromises.copyFile(currentPath, destPath);
    }
  }
};

const readComponents = () => {
  return fsPromises.readdir(path.join(__dirname, 'components'), {
    withFileTypes: true,
  });
};

const insertComponents = async (str) => {
  const components = await readComponents();
  let html = str;
  const open = '{{';
  const close = '}}';
  while (html.indexOf(open) !== -1) {
    let tag = html.slice(html.indexOf(open) + 2, html.indexOf(close));
    for (let file of components) {
      const fileName = path.basename(file.name, '.html');
      if (tag === fileName) {
        const filePath = path.join(__dirname, 'components', file.name);
        const compHtml = await fsPromises.readFile(filePath);
        html = html.replace(`{{${tag}}}`, compHtml);
        break;
      }
    }
  }
  return html;
};

const writeHtml = async (
  dist,
  file = path.join(__dirname, 'template.html'),
) => {
  const index = await createFile(dist, 'index.html');
  const readTemplate = await fs.createReadStream(file);

  readTemplate.on('data', (data) => {
    insertComponents(data.toString()).then((html) => index.stream.write(html));
  });
};

const cleanFolder = async () => {
  const distPath = path.join(__dirname, 'project-dist');
  await fsPromises.rm(distPath, { recursive: true, force: true });
};

(async () => {
  await cleanFolder();
  const dist = await createFolder(__dirname, 'project-dist');
  await writeStyles(dist);
  await copyAssets(dist);
  await writeHtml(dist);
})();
