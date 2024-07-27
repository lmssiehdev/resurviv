import { exec } from "node:child_process";
import fs from "node:fs";
import { platform } from "node:os";
import path from "node:path";

type FileData = {
    path: string;
    trimmedPath: string;
    data: {
        width: number;
        height: number;
        trimmed: boolean;
        trim: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
};

const outputFolder = "trimmed";

try {
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
        console.log(`Folder '${outputFolder}' created successfully.`);
    } else {
        const files = fs.readdirSync(outputFolder);
        for (const file of files) {
            fs.unlinkSync(path.join(outputFolder, file));
        }
        console.log(`All files in '${outputFolder}' have been deleted.`);
    }
} catch (err) {
    console.error(`Error: ${err}`);
}

export async function trimImages(files: string[]) {
    const trimmedFiles: string[] = [];

    async function trimImage(file: string) {
        return new Promise((res, rej) => {
            try {
                const sourceParts = file.split(platform() === "win32" ? "\\" : "/");
                let name = sourceParts.at(-1)!.split(".").slice(0, -1).join("");

                const newPath = path.join(outputFolder, `${name}.png`);
                // @NOTE: have to add 1px transparent border because imagemagick does trimming based on border pixel's color
                const trimCommand = `convert  -define png:exclude-chunks=date -background none "${file}" -bordercolor transparent -border 1  -trim "${newPath}"`;
                exec(trimCommand, res);
                trimmedFiles.push(newPath);
            } catch (err) {
                rej(err);
            }
        });
    }
    for (const file of files) {
        await trimImage(file);
    }

    return {
        trimmedFiles,
        trimmedSizes: await getImageSizes(trimmedFiles)
    };
}

export type TrimmedData = Map<string, FileData["data"]>;
async function getImageSizes(files: string[]): Promise<Map<string, FileData["data"]>> {
    const fileData = new Map<string, FileData["data"]>();
    const filePaths = files.map(function (file) {
        return `"${file}"`;
    });
    return new Promise((res) => {
        exec("identify " + filePaths.join(" "), function (err, stdout) {
            if (err)
                throw new Error(
                    "Execution of identify command failed. Ensure that ImageMagick Legacy Tools are installed and added to your PATH."
                );

            let sizes = stdout.split("\n");
            sizes = sizes.splice(0, sizes.length - 1);
            sizes.forEach(function (item, i) {
                const data = {} as FileData["data"];
                var size = item.match(/ ([0-9]+)x([0-9]+) /)!;
                data.width = parseInt(size[1], 10);
                data.height = parseInt(size[2], 10);
                data.trimmed = false;
                if (true) {
                    var rect = item.match(
                        / ([0-9]+)x([0-9]+)[\+\-]([0-9]+)[\+\-]([0-9]+) /
                    )!;
                    const trim = {} as FileData["data"]["trim"];
                    trim.x = parseInt(rect[3], 10) - 1;
                    trim.y = parseInt(rect[4], 10) - 1;
                    trim.width = parseInt(rect[1], 10) - 2;
                    trim.height = parseInt(rect[2], 10) - 2;

                    data.trim = trim;
                    data.trimmed =
                        data.trim.width !== data.width ||
                        data.trim.height !== data.height;
                    const key = item.split(" ")[0].split("/")[1].replace("png", "img");
                    fileData.set(key, data);
                }
            });
            res(fileData);
        });
    });
}