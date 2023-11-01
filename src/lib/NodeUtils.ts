
import * as path from "path";
import { EventDispatcher } from "./EventDispatcher";
import * as readline from "readline";



export namespace NodeUtils {

    export function GET_LOADED_MODULES(subDir: string = ''): string[] {
        const base = path.resolve(__dirname, '../', subDir);
        const main = path.resolve(base, 'main.ts');
        return Object.keys(require.cache).filter(req => {
            return req.startsWith(base) && req != main;
        });
    }

    /**
     * WARNING: This should NEVER be used in anything other than development.  
     * This WILL cause instability if there is still code being used  
     * while clearing the require cache.   
     */
    export function CLEAR_REQUIRE_CACHE(subDir: string = ''): void {
        GET_LOADED_MODULES(subDir).forEach(module => {
            delete require.cache[module];
        });
    }


    
    type KeyPress = {
        sequence: string;
        name: string;
        ctrl: boolean;
        meta: boolean;
        shift: boolean;
    }

    export class ConsoleKeyPressListener extends EventDispatcher<{
        'keypress': (key: KeyPress) => unknown;
    }> {

        constructor() {
            super();

            readline.emitKeypressEvents(process.stdin);

            if(process.stdin.isTTY) {
                process.stdin.setRawMode(true);
            }

            process.stdin.on('keypress', (chunk: string, key: KeyPress) => {
                this.dispatchEvent('keypress', key);
            });
        }
        
    }

}


