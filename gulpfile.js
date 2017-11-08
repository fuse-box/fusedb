const gulp = require("gulp");
const ts = require("gulp-typescript");
const fs = require("fs");
const path = require("path");
const runSequence = require("run-sequence");
const bump = require("gulp-bump");
const clean = require('gulp-clean');
const { exec, spawn } = require("child_process");
let projectTypings = ts.createProject("src/tsconfig.json", {
    removeComments: false,
    declaration: true
});
let projectCommonjs = ts.createProject("src/tsconfig.json", {
    target: "esnext"
});

const RELEASE_FOLDER = "./.release";
/**
 * Our commonjs only files
 */
let filesMain = ["src/**/*.{ts,tsx}", "!./**/test/**"];

const publish = (done, tag) => {
    var publish = spawn("npm", ["publish", "--tag", tag], {
        stdio: "inherit",
        cwd: path.join(__dirname, ".release")
    });
    publish.on("close", function(code) {
        if (code === 8) {
            gulp.log("Error detected, waiting for changes...");
        }
        done();
    });
}


/**
 * Combined build task
 */
gulp.task("dist", ["prepare:clean", "prepare:js", "prepare:typings", "prepare:copy-package"]);


// DIST release **************************

gulp.task("prepare:js", function() {
    return result = gulp.src(filesMain)
        .pipe(projectCommonjs()).js
        .pipe(gulp.dest(RELEASE_FOLDER));
});

gulp.task("prepare:typings", function() {
    return result = gulp.src(filesMain)
        .pipe(projectTypings()).dts
        .pipe(gulp.dest(RELEASE_FOLDER));
});
gulp.task("prepare:copy-package", function() {
    return result = gulp.src("./package.json")
        .pipe(gulp.dest(RELEASE_FOLDER))
});



gulp.task("bump-version", function() {
    let json = require("./package.json");
    let main = json.version;
    let matched = main.match(/(\d)\.(\d)\.(\d{1,})/i);
    if (matched) {
        json.version = `${matched[1]}.${matched[2]}.${(matched[3] * 1) + 1}`;
        fs.writeFileSync(__dirname + `/package.json`, JSON.stringify(json, 2, 2));
    } else {
        throw new Error("Invalid beta template")
    }
});

gulp.task("prepare:clean", function() {
    return result = gulp.src(RELEASE_FOLDER, { read: false })
        .pipe(clean());
});
gulp.task("prepare", ["prepare:clean"], function(done) {
    return runSequence("prepare:js", "prepare:typings", "bump-version", "prepare:copy-package", done)
});

gulp.task("publish-beta", function(done) {
    publish(done, "alpha");
});
gulp.task("publish", function(done) {
    return runSequence("prepare", "publish-beta", done)
});







gulp.task("watch", ["dist-commonjs"], function() {

    gulp.watch(["src/**/*.ts"], () => {
        runSequence("dist-commonjs");
    });
});


gulp.task("dev:copy", function(done) {
    return gulp.src([`${RELEASE_FOLDER}/**/**`]).pipe(
        gulp.dest("../hello/node_modules/wires-ts")
    )
});


gulp.task("watch2", ["dist-commonjs"], function() {
    runSequence("prepare:js", "dev:copy")
    gulp.watch(["src/**/*.ts"], () => {
        runSequence("prepare:js", "prepare:typings", "dev:copy")
    });
});