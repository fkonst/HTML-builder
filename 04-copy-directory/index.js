const fsPromises = require('fs/promises');
const path = require('path');

const createFolder = (folder) => {
  fsPromises.mkdir(folder);
};

const readDir = (folder) => {
  return fsPromises.readdir(folder, { withFileTypes: true });
};

const cleanFolder = async (folder) => {
  await fsPromises.rm(folder, { recursive: true, force: true });
};

const copyDir = async (files, srcDir, destDir) => {
  for (let file of files) {
    const fileName = path.basename(file.name);
    const copyFilePath = path.join(destDir, fileName);
    const originFilePath = path.join(srcDir, file.name);
    await fsPromises.copyFile(originFilePath, copyFilePath);
  }
};

(async () => {
  const destDir = path.join(__dirname, 'files-copy');
  const srcDir = path.join(__dirname, 'files');
  await cleanFolder(destDir);
  await createFolder(destDir);
  const files = await readDir(srcDir);

  await copyDir(files, srcDir, destDir);
})();
