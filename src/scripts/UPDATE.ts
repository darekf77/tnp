import { Project } from '../project';
import { info, error } from '../messages';
import * as fs from 'fs';
import * as path from 'path';


export function rebuildTnp() {
    const p = Project.Tnp;
    const backupFolderDist = 'tmp-dist-current';
    p.run(`rimraf ${backupFolderDist}`).sync();
    p.run(`git reset --hard`).sync();
    p.run(`git pull origin master`).sync();
    try {
        p.run(`cpr dist ${backupFolderDist}`).sync()
        p.run(`(rimraf dist && tsc) || (cpr ${backupFolderDist} dist && rimraf ${backupFolderDist}  && echo "Something went wrong with rebuild of tnp") `).sync()
        const backupDist = path.join(p.location, backupFolderDist);
        if (fs.existsSync(backupDist)) {
            p.run(`rimraf ${backupFolderDist}`);
            error(`Tnp self update not successfull`);            
        } else {
            info(`Tnp self update success`);
        }
    } catch (e) {
        error(`Tnp self update not successfull 
        
            ${e}
        `); 
    }
}


export default {
    $UPDATE: (args) => {
        rebuildTnp();
        process.exit(0)
    }
}