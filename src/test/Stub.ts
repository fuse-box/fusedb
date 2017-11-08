import * as appRoot from "app-root-path"
import * as path from "path"
import * as fs from "fs-extra";
import { FuseDB } from "../FuseDB";
import { FileAdapter } from "../adapters/FileAdapter";
export class Stub {
    folder: string;
    dbname: string;
    constructor() {
        this.dbname = Math.random().toString();
        this.folder = path.join(appRoot.path, ".fusebox/.tmp")
        FuseDB.setup({
            adapter:
                FileAdapter({ path: this.folder, database: this.dbname })
        })
        fs.ensureDirSync(this.folder)
    }
    
    public clear() {
        setTimeout(() => {
            fs.removeSync(path.join(this.folder, this.dbname));    
        }, 0);
        
    }
}