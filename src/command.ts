
import { ChatInputCommandInteraction, AutocompleteInteraction, LocalizationMap, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandStringOption, ApplicationCommandOptionBase, ApplicationCommandOptionWithChoicesAndAutocompleteMixin } from "discord.js";



type Awaitable<T> = Promise<T> | T;



type ChoiceType<T extends string | number | undefined> = 
    T extends undefined ? never :
    T extends number ? {
        name: string;
        name_localizations?: LocalizationMap;
        value: T;
    } :
    T extends string ? ({
        name: string;
        name_localizations?: LocalizationMap;
        value: T;
    } | string) : never;



interface ArgBaseConstructorOptions<Autocomplete extends string | number | undefined = undefined> {
    /** This is set from the key in the arg object. */
    readonly name?: never;
    readonly name_localizations?: LocalizationMap;
    readonly description?: string;
    readonly description_localizations?: LocalizationMap;

    readonly choices?: (Autocomplete extends undefined ? never : ChoiceType<Autocomplete>)[];
    readonly autocomplete?: (interaction: AutocompleteInteraction) => Awaitable<(Autocomplete extends undefined ? never : ChoiceType<Autocomplete>)[]>;
}

abstract class ArgBase<Autocomplete extends string | number | undefined> {

    public readonly name_localizations?: LocalizationMap;
    public readonly description?: string;
    public readonly description_localizations?: LocalizationMap;

    public readonly choices?: (Autocomplete extends undefined ? never : ChoiceType<Autocomplete>)[];
    public readonly autocomplete?: (interaction: AutocompleteInteraction) => Awaitable<(Autocomplete extends undefined ? never : ChoiceType<Autocomplete>)[]>;

    constructor(options: ArgBaseConstructorOptions<Autocomplete>) {
        this.name_localizations = options.name_localizations;
        this.description = options.description;
        this.description_localizations = options.description_localizations;
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

export class ArgNumber extends ArgBase<number> {

    public readonly type: 'number' | 'integer';
    public readonly min?: number;
    public readonly max?: number;

    constructor(options: {
        readonly type: 'number' | 'integer';
        readonly min?: number;
        readonly max?: number;
    } & ArgBaseConstructorOptions<number>) {
        super(options);
        this.type = options.type;
        this.min = options.min;
        this.max = options.max;
    }

    public optional(): ArgOptional<this> {
        return new ArgOptional(this);
    }

}

export class ArgString extends ArgBase<string> {

    constructor(options: {

    } & ArgBaseConstructorOptions<string>) {
        super(options);
    }

    public optional(): ArgOptional<this> {
        return new ArgOptional(this);
    }

}



type ArgType = ArgNumber | ArgString;
type ArgTypeWithOptionals = ArgType | ArgOptional<any>



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

    public builder(): SlashCommandBuilder {

        const builder = new SlashCommandBuilder();

        for(const key in this.args) {
            let arg = this.args[key];
            let optional = false;

            if(arg instanceof ArgOptional) {
                arg = arg.arg;
                optional = true;
            }

            let option;

            if(arg instanceof ArgNumber) {

                option = new (arg.type == 'integer' ? SlashCommandIntegerOption : SlashCommandNumberOption)();
                if(arg.min !== undefined) option.setMinValue(arg.min);
                if(arg.max !== undefined) option.setMaxValue(arg.max);

            } else if(arg instanceof ArgString) {
                
                option = new SlashCommandStringOption();

            } else {
                throw new Error('Invalid argument type.');
            }

            if(option instanceof ApplicationCommandOptionWithChoicesAndAutocompleteMixin) {
                if(arg.choices) {
                    // @ts-ignore - TODO: Don't use ts-ignore here. It probably isn't necessary.
                    option.setChoices(...arg.choices.map(choice => {
                        return typeof choice == 'string' ? { name: choice, value: choice } : choice;
                    }));
                }
            }

            option.setRequired(!optional);
            option.setName(key);
            if(arg.name_localizations) option.setNameLocalizations(arg.name_localizations);
            if(arg.description) option.setDescription(arg.description);
            if(arg.description_localizations) option.setDescriptionLocalizations(arg.description_localizations);

            builder.options.push(option);

        }

        return builder;

    }

    public execute(interaction: ChatInputCommandInteraction): void {
        const opts = interaction.options;

        // @ts-ignore
        const parsed: ExtractArgs<A> = {};

        for(const key in this.args) {
            let arg = this.args[key];
            let optional = false;

            if(arg instanceof ArgOptional) {
                arg = arg.arg;
                optional = true;
            }

            if(arg instanceof ArgNumber) {
                const num = arg.type == 'integer' ? opts.getInteger(key) : opts.getInteger(key);
                // @ts-ignore
                if(num) parsed[key] = num;
            } else if(arg instanceof ArgString) {
                const str = opts.getString(key);
                // @ts-ignore
                if(str) parsed[key] = str;
            } else {
                throw new Error('Invalid argument type.');
            }

        }

        this.executefn(interaction, parsed);

    }

}





(async function() {
    
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

    console.log(cmd.builder());

})();


