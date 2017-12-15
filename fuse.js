const { src, task, exec, context, tsc, bumpVersion, npmPublish } = require("fuse-box/sparky");
const { FuseBox, QuantumPlugin, WebIndexPlugin } = require("fuse-box");

task("default", async context => {
    await context.clean();
    await context.development();
});

task("tsc", async() => {
    await tsc("src", {
        target: "esnext",
        declaration: true,
        outDir: "dist/"
    });
});

task("dist", async context => {
    await context.clean();
    await context.prepareDistFolder();
    await context.dist("esnext", "es7");
    await context.dist("es6", "es6");
    await exec("tsc")
});

task("publish", async() => {
    await exec("dist")
    await npmPublish({ path: "dist" });
})

context(class {
    getConfig() {
        return FuseBox.init({
            homeDir: "src",
            globals: { 'default': '*' }, // we need to expore index in our bundles
            target: this.target,
            output: "dist/$name.js",
            cache: !this.isProduction,
            plugins: [!this.isProduction && WebIndexPlugin(),
                this.isProduction && QuantumPlugin({
                    containedAPI: true,
                    ensureES5: false,
                    target: this.quantumTarget,
                    uglify: true,
                    bakeApiIntoBundle: this.bundleName
                })
            ]
        });
    }
    async tsc() {
        await tsc("src", {
            target: "esnext"
        });
    }

    async clean() {
        await src("./dist").clean("dist/").exec();
    }

    async prepareDistFolder() {
        await bumpVersion("package.json", { type: "patch" });
        await src("./package.json").dest("dist/").exec();
    }

    development() {
        this.target = "server@next";
        this.bundleName = "app";
        this.isProduction = false;
        this.instructions = ">[_development/index.ts]";
        const fuse = this.getConfig();
        const bundle = fuse.bundle(this.bundleName)
            .instructions(this.instructions).completed(proc => proc.start()).watch();
        return fuse.run();
    }

    dist(target, name) {
        this.target = `server@${target}`;
        this.bundleName = name;
        this.isProduction = true;
        this.quantumTarget = "npm";
        this.instructions = ">[index.ts]";
        const fuse = this.getConfig();
        const bundle = fuse.bundle(this.bundleName)
            .instructions(this.instructions);
        return fuse.run();
    }
});