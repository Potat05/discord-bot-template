
// THIS COMMAND REQUIRES MESSAGE CONTENT INTENT TO BE TRUE.

import { EmojiTable, InteractionHelper, UserQueue, clearReply, embed } from "../lib/DiscordUtils";
import * as words from "../resources/wordle.json";
import { Command } from "../lib/Command";
import { CommandCreator } from "../lib/CommandRegistry";



const userQueue = new UserQueue(Infinity, 1);



export const creator: CommandCreator = options => {
    const command = new Command({
        name: options.name,
        description: 'Play a game of Wordle.',
        args: { },
        executefn: async interaction => {
    
            const interactionHelper = new InteractionHelper(interaction, {
                showFastQueueDelay: 2000
            });
            if(!interaction.channel) {
                return await interactionHelper.show('Invalid channel.');
            }
            if(!userQueue.add(interactionHelper.user)) {
                return await interactionHelper.show(embed.error('Already Playing', 'You already are playing a game of Wordle!'));
            }
    
            const guessWord = words.allowed[words.possible[Math.floor(Math.random() * words.possible.length)]];
            const numGuesses: number = 6;
            let guesses: string[] = [];
    
            const displayGuess = (message: string = '') => {
                const table = new EmojiTable(6, 6);
    
                for(let guessInd = 0; guessInd < numGuesses; guessInd++) {
                    if(guessInd < guesses.length) {
                        for(let i = 0; i < 5; i++) {
                            const char = guesses[guessInd][i];
                            table.set(
                                i, guessInd,
                                guessWord[i] == char ? '🟩' : 
                                guessWord.includes(char) ? '🟨' :
                                '⬜'
                            );
                            table.set(5, guessInd, `\`${guesses[guessInd]}\``);
                        }
                    } else {
                        for(let i = 0; i < 5; i++) {
                            table.set(i, guessInd, '⬛');
                        }
                    }
                }
    
                const state = 
                    guesses.includes(guessWord) ? 'Win' :
                    guesses.length >= numGuesses ? `Loss - Word \`${guessWord}\`` :
                    'Playing';
    
                interactionHelper.showFast(`Wordle ${state}\n${table.final()}\n${message}`);
            }
    
            const collector = interaction.channel.createMessageCollector({
                filter: message => {
                    if(!message.member) return false;
                    if(!message.member.user.equals(interaction.user)) return false;
                    return true;
                },
                time: 10 * 60 * 1000
            });
    
            collector.on('collect', async message => {
                if(!/^\w{5}$/.test(message.content)) {
                    interactionHelper.showFast(clearReply(embed.error('Game Canceled', 'Invalid input.')));
                    collector.stop();
                    return;
                }
    
                message.delete();
    
                
                const guess = message.content.toLowerCase();
    
                if(!(words.allowed.some(word => word == guess))) {
                    displayGuess('Invalid word.');
                    return;
                }
    
                guesses.push(guess);
    
                if(guesses.length >= numGuesses || guess == guessWord) {
                    collector.stop('end');
                }
    
                displayGuess();
    
            });
    
            collector.on('end', () => {
                collector.removeAllListeners();
    
                if(collector.endReason == 'time') {
                    displayGuess('Timeout.');
                }
    
                userQueue.remove(interactionHelper.user);
            });
    
            displayGuess('Message any 5 letter word to guess.');

        }
    });

    return { command };
}


