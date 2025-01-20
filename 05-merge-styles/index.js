const fs = require('fs');
const path = require('path');
const fsPromises = require('fs/promises');

const getStyles = () => {
  const styles = path.join(__dirname, 'styles');
  return fsPromises
    .readdir(styles, { withFileTypes: true })
    .then((files) =>
      files.filter(
        (file) => file.isFile() && path.extname(file.name) === '.css',
      ),
    );
};

const writeBundle = (styles) => {
  const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');
  const writeStream = fs.createWriteStream(bundlePath);
  for (let file of styles) {
    const filePath = path.join(file.parentPath, file.name);
    const readStream = fs.createReadStream(filePath);
    readStream.on('data', (data) => writeStream.write(data));
  }
};

const checkBundle = () => {
  const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');
  return fsPromises.unlink(bundlePath).catch(() => {});
};

(async () => {
  await checkBundle();
  const styles = await getStyles();
  writeBundle(styles);
})();
