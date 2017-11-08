const { FuseBox } = require("fuse-box");
const fuse = FuseBox.init({
    homeDir : "src",
    target : "server",
    output : "dist/$name.js"
});


let file = process.argv[2];
let special = file && file.match(/^--file=(.*)/);
let mask = '*.test.ts';
if (special) {
    mask = special = special[1];
}


fuse.bundle("app").test(`[**/${mask}]`);