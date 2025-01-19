const fs = require("fs");
const path = require("path");
const fsPromises = require("fs/promises");

const createFolder = async (pathFolder, nameFolder) => {
    const folderPath = path.join(pathFolder, nameFolder);
    await fsPromises.mkdir(folderPath, { recursive: true });
    return folderPath;
}

const createFile = (dist, fileName) => {
    const filePath = path.join(dist, fileName)
    const writeStream = fs.createWriteStream(filePath);
    return {
        path: filePath,
        stream: writeStream,
    };
}

const writeStyles = async (dist) => {
    const style = await createFile(dist, "style.css");
    const stylesPath = path.join(__dirname, "styles")
    const styles = await fsPromises.readdir(stylesPath, { withFileTypes: true} )
                                    .then(files => files
                                        .filter(file => file.isFile() && path.extname(file.name) === ".css"));
    for (let file of styles) {
        const filePath = path.join(file.parentPath, file.name);
        const readStream = fs.createReadStream(filePath);
        readStream.on("data" , data => style.stream.write(data));
    }
}


const copyAssets = async (dest, src = path.join(__dirname, "assets")) => {
    const folderName = path.basename(src);
    const readSrc = await fsPromises.readdir(src, { withFileTypes: true });
    const createDestFolder = await createFolder(dest, folderName);
    for (let file of readSrc) {
        if (file.isDirectory()) {
            const currentPath = path.join(src, file.name)
            await copyAssets(createDestFolder, currentPath);
        } else if (file.isFile()) {
            const currentPath = path.join(src, file.name);
            const destPath = path.join(createDestFolder, file.name);
            await fsPromises.copyFile(currentPath, destPath);
        }
    }
}

(async () => {
    const dist = await createFolder(__dirname ,"project-dist");
    await writeStyles(dist);
    await copyAssets(dist);
    // const index = await createFile(dist, "index.html");
})()