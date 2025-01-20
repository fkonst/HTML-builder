const fsPromises = require('fs/promises');
const path = require('path');
const secretFolder = path.join(__dirname, 'secret-folder');

const getReadFolder = (path) => {
  const files = fsPromises.readdir(path, { withFileTypes: true });
  return files;
};

const getFiles = async (rootPath) => {
  const getFolderData = await getReadFolder(rootPath);
  const files = [];
  for (let file of getFolderData) {
    if (file.isFile()) {
      files.push(file);
    }
  }
  return files;
};

const writeFiles = async () => {
  const files = await getFiles(secretFolder);
  let result = [];
  for (let file of files) {
    const name = path.basename(file.name).slice(0, file.name.indexOf('.'));
    const extName = path.extname(file.name).slice(1);
    const fileSize = await fsPromises.stat(
      path.join(file.parentPath, file.name),
    );
    const str = `${name} - ${extName} - ${(+fileSize.size / 1024).toFixed(
      3,
    )}kb`;
    result.push(str);
  }
  return result;
};

(async () => {
  const result = await writeFiles();
  console.log(result);
})();
