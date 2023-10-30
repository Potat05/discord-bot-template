
import { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";



type Awaitable<T> = Promise<T> | T;



interface ArgAutocompleteConstructorOptions<T> {
    choices?: T[];
    autocomplete?: (interaction: AutocompleteInteraction) => Awaitable<T[]>
}

abstract class ArgAutocomplete<T> {
    readonly choices?: T[];
    readonly autocomplete?: (interaction: AutocompleteInteraction) => Awaitable<T[]>;

    constructor(options: ArgAutocompleteConstructorOptions<T>) {
        this.choices = options.choices;
        this.autocomplete = options.autocomplete;
    }
}



class ArgOptional<Arg extends ArgType> {

    public readonly arg: Arg;

    constructor(arg: Arg) {
        this.arg = arg;
    }

    public required(): Arg {
        return this.arg;
    }

}

export class ArgNumber extends ArgAutocomplete<number> {

    public readonly type: 'number' | 'integer';
    public readonly min?: number;
    public readonly max?: number;

    constructor(options: {
        readonly type: 'number' | 'integer';
        readonly min?: number;
        readonly max?: number;
    } & ArgAutocompleteConstructorOptions<number>) {
        super(options);
        this.type = options.type;
        this.min = options.min;
        this.max = options.max;
    }

    public optional(): ArgOptional<this> {
        return new ArgOptional(this);
    }

}

export class ArgString extends ArgAutocomplete<string> {

    constructor(options: {

    } & ArgAutocompleteConstructorOptions<string>) {
        super(options);
    }

    public optional(): ArgOptional<this> {
        return new ArgOptional(this);
    }

}



type ArgType = ArgNumber | ArgString;
type ArgTypeWithOptionals = ArgType | ArgOptional<any>



// TODO: If autocomplete choices, make type choices.
type GetArgType<A extends ArgTypeWithOptionals> = 
    A extends ArgOptional<infer OptType> ? GetArgType<OptType> | undefined :
    A extends ArgNumber ? number :
    A extends ArgString ? string :
    never;


type ExtractArgs<A extends {[key: string]: ArgTypeWithOptionals}> = {
    [Key in keyof A]: GetArgType<A[Key]>;
}



export class Command<A extends {[key: string]: ArgTypeWithOptionals}> {

    public readonly args: A;
    private readonly executefn: (interaction: ChatInputCommandInteraction, args: ExtractArgs<A>) => unknown;

    constructor(options: {
        args: A,
        executefn: (interaction: ChatInputCommandInteraction, args: ExtractArgs<A>) => unknown
    }) {
        this.args = options.args;
        this.executefn = options.executefn;
    }

    public execute(interaction: ChatInputCommandInteraction): void {
        const opts = interaction.options;

        // @ts-ignore
        const parsed: ExtractArgs<A> = {};

        for(const key in this.args) {
            let arg = this.args[key];
            let optional = false;

            if(arg instanceof ArgOptional) {
                optional = true;
                arg = arg.arg;
            }

            if(arg instanceof ArgNumber) {
                const num = arg.type == 'integer' ? opts.getInteger(key) : opts.getInteger(key);
                // @ts-ignore
                if(num) parsed[key] = num;
            } else if(arg instanceof ArgString) {
                const str = opts.getString(key);
                // @ts-ignore
                if(str) parsed[key] = str;
            }

        }

        this.executefn(interaction, parsed);

    }

}



const cmd = new Command({
    args: {
        test: new ArgNumber({
            type: 'integer',
            min: 0,
            max: 100
        }),
        message: new ArgString({
            choices: [ 'test', 'hello' ]
        }).optional()
    },
    executefn: (interaction, args) => {

    }
});


