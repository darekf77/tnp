import * as path from 'path';
import { subscribe, } from '@parcel/watcher';
import { Subject } from 'rxjs';
export class LinuxFileWatcher {
    options;
    sub;
    change$ = new Subject();
    rebuild$ = this.change$.asObservable();
    debounceTimer;
    constructor(options) {
        this.options = options;
    }
    async start() {
        //#region @backendFunc
        const { cwd, isomorphicPackages = [] } = this.options;
        const pathsToWatch = [
            path.join(cwd, 'src'),
            path.join(cwd, 'package.json'),
            path.join(cwd, 'package-lock.json'),
            path.join(cwd, 'pnpm-lock.yaml'),
            path.join(cwd, 'yarn.lock'),
            path.join(cwd, 'node_modules'), // filtered later
            ...isomorphicPackages.map(p => path.resolve(cwd, p)),
        ];
        this.sub = await subscribe(cwd, (err, events) => {
            if (err) {
                console.error('[taon] watcher error', err);
                return;
            }
            console.log('[taon] watcher events', events);
            let shouldTrigger = false;
            // for (const e of events) {
            //   const p = e.path;
            //   // --- SRC ---
            //   if (p.includes('/src/')) {
            //     shouldTrigger = true;
            //     break;
            //   }
            //   // --- LOCKFILES / ROOT ---
            //   if (
            //     p.endsWith('package.json') ||
            //     p.endsWith('package-lock.json') ||
            //     p.endsWith('pnpm-lock.yaml') ||
            //     p.endsWith('yarn.lock')
            //   ) {
            //     shouldTrigger = true;
            //     break;
            //   }
            //   // --- NODE_MODULES (ONLY FIRST LEVEL) ---
            //   if (p.includes('/node_modules/')) {
            //     const rel = p.split('/node_modules/')[1];
            //     if (
            //       rel &&
            //       rel.split('/').length === 2 &&
            //       rel.endsWith('package.json')
            //     ) {
            //       shouldTrigger = true;
            //       break;
            //     }
            //   }
            //   // --- ISOMORPHIC PACKAGES ---
            //   for (const iso of isomorphicPackages) {
            //     if (p.startsWith(path.resolve(cwd, iso))) {
            //       shouldTrigger = true;
            //       break;
            //     }
            //   }
            //   if (shouldTrigger) break;
            // }
            if (shouldTrigger) {
                this.triggerDebounced();
            }
        }, {
            ignore: [
                '**/.git/**',
                '**/dist/**',
                '**/.angular/**',
                '**/.cache/**',
                '**/coverage/**',
            ],
        });
        console.log('[taon] watcher started');
        //#endregion
    }
    stop() {
        this.sub?.unsubscribe();
        this.sub = undefined;
        console.log('[taon] watcher stopped');
    }
    triggerDebounced() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            console.log('[taon] change detected → rebuild');
            this.change$.next({});
        }, 3000);
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/linux-file-watcher.js.map