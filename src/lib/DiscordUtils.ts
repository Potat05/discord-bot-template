import { ActionRowData, ChannelType, Client, Interaction, InteractionReplyOptions, ModalActionRowComponentData, ModalSubmitInteraction, User } from "discord.js";
import { SingularItemQueue } from "./Utils";
import { randomUUID } from "crypto";
import { resources } from "../resources/resources";



export class InteractionHelper<T extends Interaction = Interaction> {

    public interaction: T;
    public modalInteraction: ModalSubmitInteraction | null = null;
    public cancelled: boolean = false;
    /** If this interaction is only visible to the person that triggered it. */
    public ephemeral: boolean;

    public get user(): User {
        return this.interaction.user;
    }

    public get client(): Client {
        return this.interaction.client;
    }

    constructor(interaction: T, options: {
        /**
         * How often InteractionHelper.showFast shall update.  
         * Discord recommends a min of 1000ms delay per change.  
         * @default 3000
         */
        readonly showFastQueueDelay?: number;
        /**
         * If this interaction is only visible to the person that triggered it.  
         * @default false
         */
        readonly ephemeral?: boolean;
    }) {
        this.interaction = interaction;

        this.showFastQueue = new SingularItemQueue(options.showFastQueueDelay ?? 3000);
        this.showFastQueue.addEventListener('next', item => {
            this.show(item);
        });

        this.ephemeral = options.ephemeral ?? false;
    }

    public executeModal(modal: { title: string, components: ActionRowData<ModalActionRowComponentData>[] }, time: number = 3 * 60 * 1000): Promise<ModalSubmitInteraction | null> {
        return new Promise(async (resolve, reject) => {
            if(!this.interaction.isCommand() && !this.interaction.isButton()) return resolve(null);

            const uuid = randomUUID();

            await this.interaction.showModal({ ...modal, customId: uuid });

            await this.interaction.awaitModalSubmit({
                time,
                filter: interaction => interaction.customId == uuid
            }).then(modalInteraction => {
                this.modalInteraction = modalInteraction;
                resolve(this.modalInteraction);
            }).catch(() => {
                this.cancelled = true;
                resolve(null);
            });

        });
    }

    public async show(message: string | Omit<InteractionReplyOptions, 'ephemeral'>): Promise<void> {
        if(this.cancelled) return; // If this modal has been cancelled, we cannot reply.

        const interaction = this.modalInteraction ?? this.interaction;

        if(!interaction.isRepliable()) return;

        // Show overwrites showFast.
        this.showFastQueue.skip();

        if(interaction.replied) {
            await interaction.editReply(message);
        } else {
            if(typeof message == 'string') {
                await interaction.reply({
                    content: message,
                    ephemeral: this.ephemeral
                });
            } else {
                await interaction.reply({
                    ...message,
                    ephemeral: this.ephemeral
                });
            }
        }
    }



    private readonly showFastQueue: SingularItemQueue<string | InteractionReplyOptions>;

    /**
     * Use this if updating messages a lot in a short period.
     */
    public showFast(message: string | InteractionReplyOptions): void {
        this.showFastQueue.queue(message);
    }

}

export function clearReply(override?: string | InteractionReplyOptions): InteractionReplyOptions {
    if(typeof override == 'string') {
        return {
            content: override,
            embeds: [],
            components: [],
            files: [],
        }
    } else {
        return {
            content: '',
            embeds: [],
            components: [],
            files: [],
            ...override
        }
    }
}

export const embed = {
    none: (message: string) => message,
    success: (message: string) => ({
        embeds: [{
            color: resources.color.success,
            title: 'Success',
            description: message,
            thumbnail: {
                url: resources.icon.success
            }
        }]
    }),
    info: (message: string) => ({
        embeds: [{
            color: resources.color.info,
            title: 'Information',
            description: message,
            thumbnail: {
                url: resources.icon.info
            }
        }]
    }),
    warning: (name: string, description: string = '') => ({
        embeds: [{
            color: resources.color.warning,
            title: 'Warning',
            fields: [{
                name: name,
                value: description
            }],
            thumbnail: {
                url: resources.icon.warning
            }
        }]
    }),
    error: (name: string, description: string = '') => ({
        embeds: [{
            color: resources.color.error,
            title: 'Error',
            fields: [{
                name: name,
                value: description
            }],
            thumbnail: {
                url: resources.icon.error
            }
        }]
    }),
    catastrophicError: (name: string, logValue: any) => {
        const uuid = randomUUID();
        console.error(name, uuid, logValue);
        return {
            embeds: [{
                color: resources.color.error,
                title: 'Catastrophic Error',
                fields: [{
                    name: name,
                    value: `Please contact bot owner with error\n\`${uuid}\``
                }],
                thumbnail: {
                    url: resources.icon.error
                },
                timestamp: new Date().toISOString()
            }]
        };
    }
}



export function isDiscordSpoiler(str: string): boolean {
    // TODO: Make regex better.
    // Having '|| || ||' makes this incorrect.
    return /^\|\|.+\|\|$/.test(str);
}

export function isInteractionInNSFWChannel(interaction: Interaction): boolean {
    return (!!interaction.channel && interaction.channel.type == ChannelType.GuildText && interaction.channel.nsfw)
}



export class UserQueue {

    private users: Map<string, number> = new Map();

    private total(): number {
        return Array.from(this.users.values()).reduce((total, value) => total + value, 0);
    }

    private get(user: User): number {
        return this.users.get(user.id) ?? 0;
    }

    private clear(user: User): void {
        this.users.delete(user.id);
    }

    private set(user: User, value?: number): void {
        if(value === undefined || value <= 0) {
            this.clear(user);
        } else {
            this.users.set(user.id, value);
        }
    }

    private inc(user: User, add: number): void {
        this.set(user, this.get(user) + add);
    }

    public readonly maxInQueue: number;
    public readonly maxPerUser: number;

    constructor(maxInQueue: number, maxPerUser: number) {
        this.maxInQueue = maxInQueue;
        this.maxPerUser = maxPerUser;
    }
    


    /**
     * @returns - If user was successfully added.
     */
    public add(user: User): boolean {
        if(this.total() >= this.maxInQueue) return false;
        if(this.get(user) >= this.maxPerUser) return false;
        this.inc(user, 1);
        return true;
    }

    public remove(user: User): boolean {
        if(this.get(user) <= 0) return false;
        this.inc(user, -1);
        return true;
    }

}



/**
 * https://unicode-explorer.com/articles/space-characters
 * Spaces that are same width as an emoji on Discord.
 */
export const EmojiWidthSpacing: string = '      ';

export class EmojiTable {

    readonly width: number;
    readonly height: number;

    private table: string[];

    public defaultString: string;

    constructor(width: number, height: number, defaultString: string = EmojiWidthSpacing) {
        this.width = width;
        this.height = height;
        this.defaultString = defaultString;
        this.table = new Array(this.width * this.height).fill(defaultString);
    }

    public validPos(x: number, y: number): boolean {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        if(!Number.isInteger(x) || !Number.isInteger(y)) return false;
        return true;
    }

    private index(x: number, y: number): number {
        if(!this.validPos(x, y)) {
            throw new Error('Invalid EmojiTable position.');
        }
        return x + y * this.width;
    }

    public set(x: number, y: number, value: string = this.defaultString): string {
        const index = this.index(x, y);
        const last = this.table[index];
        this.table[index] = value;
        return last;
    }

    public get(x: number, y: number): string {
        return this.table[this.index(x, y)];
    }

    public put(table: EmojiTable, px: number, py: number): void {
        for(let dx = 0; dx < table.width; dx++) {
            for(let dy = 0; dy < table.height; dy++) {
                const x = px + dx;
                const y = py + dy;

                if(!this.validPos(x, y)) continue;

                this.set(x, y, table.get(dx, dy));
            }
        }
    }

    public final(): string {
        let str = '';

        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                str += this.get(x, y);
            }

            if(y != this.height - 1) {
                str += '\n';
            }
        }

        if(str.trimStart() != str) {
            // Add invisible first character to stop trimming messing with the string.
            str = '​' + str;
        }

        return str;
    }

}

