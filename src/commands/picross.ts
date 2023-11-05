import { Arg, Command } from "../lib/Command";
import { CommandCreator } from "../lib/CommandRegistry";
import { EmojiTable, embed } from "../lib/DiscordUtils";

export const creator: CommandCreator = options => {
    const command = new Command({
        name: options.name,
        description: 'Test command • Echo the message.',
        args: {
            size: new Arg.String({
                required: false,
                default: '6x6',
                description: 'Size of Picross game.',
                choices: [ '4x4', '5x5', '6x6', '7x7', '8x8' ]
            })
        },
        executefn: async (interaction, args) => {
    
            const [ width, height ] = args.size.split('x').map(v => parseInt(v));
            if(!width || !height || Number.isNaN(width) || Number.isNaN(height)) {
                return await interaction.reply(embed.error('Invalid Picross Board', 'Failed to parse width & height from size string.'));
            }

            // Generate board.
            const percentage = (Math.random() * 0.3 + 0.3); // 0.3-0.6
            const board: boolean[] = new Array(width * height).fill(false);
            let setCount = Math.round((width * height) * percentage);
            while(setCount > 0) {
                const i = Math.floor(Math.random() * board.length);
                if(board[i]) continue;
                board[i] = true;
                setCount--;
            }

            const get = (x: number, y: number): boolean => {
                if(x < 0 || x >= width || y < 0 || y >= height) return false;
                return board[x + y * width];
            }

            // Evaluate hints
            const colHints: number[][] = new Array(width).fill(null).map(() => []);
            for(let x = 0; x < width; x++) {
                let streak: number = 0;
                for(let y = 0; y <= height; y++) {
                    if(!get(x, y)) {
                        if(streak > 0) {
                            colHints[x].push(streak);
                        }
                        streak = 0;
                    } else {
                        streak++;
                    }
                }
            }

            const rowHints: number[][] = new Array(height).fill(null).map(() => []);
            for(let y = 0; y < height; y++) {
                let streak: number = 0;
                for(let x = 0; x <= width; x++) {
                    if(!get(x, y)) {
                        if(streak > 0) {
                            rowHints[y].push(streak);
                        }
                        streak = 0;
                    } else {
                        streak++;
                    }
                }
            }

            // Generate board string.
            const colHintsRows = colHints.reduce((total, col) => Math.max(total, col.length), 0);
            const rowHintsCols = rowHints.reduce((total, row) => Math.max(total, row.length), 0);

            const table = new EmojiTable(width + rowHintsCols, height + colHintsRows);

            const numbers = [undefined, '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
            const correct = '||🔵||';
            const incorrect = `||❌||`;

            // Board
            for(let x = 0; x < width; x++) {
                for(let y = 0; y < height; y++) {
                    table.set(
                        x + rowHintsCols, y + colHintsRows,
                        get(x, y) ? correct : incorrect
                    );
                }
            }

            // Top hints
            for(let col = 0; col < width; col++) {
                const hints = colHints[col];
                for(let i = 0; i < hints.length; i++) {
                    table.set(
                        rowHintsCols + col, colHintsRows - hints.length + i,
                        numbers[hints[i]]
                    );
                }
            }

            // Left hints
            for(let row = 0; row < width; row++) {
                const hints = rowHints[row];
                for(let i = 0; i < hints.length; i++) {
                    table.set(
                        rowHintsCols - hints.length + i, colHintsRows + row,
                        numbers[hints[i]]
                    );
                }
            }

            // Reply with board.
            await interaction.reply(table.final());
    
        }
    });

    return { command };
}


