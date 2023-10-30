
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
    readonly description: string;
    readonly description_localizations?: LocalizationMap;

    readonly choices?: (Autocomplete extends undefined ? never : ChoiceType<Autocomplete>)[];
    readonly autocomplete?: (interaction: AutocompleteInteraction) => Awaitable<(Autocomplete extends undefined ? never : ChoiceType<Autocomplete>)[]>;
}

abstract class ArgBase<Autocomplete extends string | number | undefined> {

    public readonly name_localizations?: LocalizationMap;
    public readonly description: string;
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



    // TODO: Make this not abstract, there has to be a way not to include this on every sub-class.
    public abstract optional(): ArgOptional<any>;



    protected optionBase<T extends ApplicationCommandOptionBase>(option: T): T {
        if(this.name_localizations) option.setDescriptionLocalizations(this.name_localizations);
        option.setDescription(this.description);
        if(this.description_localizations) option.setDescriptionLocalizations(this.description_localizations);

        // TODO: Try not to use ts-ignore here.
        // @ts-ignore
        if(option.setChoices) {
            if(this.choices) {
                const choices = this.choices.map(choice => {
                    return typeof choice == 'string' ? { name: choice, value: choice } : choice;
                });
                // @ts-ignore
                option.setChoices(...choices);
            }
        }

        option.setRequired(true);

        return option;
    }
    public abstract option(): ApplicationCommandOptionBase;

}



// TODO: Add default option.
class ArgOptional<Arg extends ArgType> {

    public readonly arg: Arg;

    constructor(arg: Arg) {
        this.arg = arg;
    }

    public required(): Arg {
        return this.arg;
    }

    public option(): ApplicationCommandOptionBase {
        const option = this.arg.option();
        option.setRequired(false);
        return option;
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

    public optional(): ArgOptional<this> { return new ArgOptional(this); }

    public option(): SlashCommandNumberOption | SlashCommandIntegerOption {
        const option = new (this.type == 'number' ? SlashCommandNumberOption : SlashCommandIntegerOption)();
        this.optionBase(option);

        if(this.min !== undefined) option.setMinValue(this.min);
        if(this.max !== undefined) option.setMaxValue(this.max);

        return option;
    }

}

export class ArgString extends ArgBase<string> {

    constructor(options: {

    } & ArgBaseConstructorOptions<string>) {
        super(options);
    }

    public optional(): ArgOptional<this> { return new ArgOptional(this); }

    public option(): SlashCommandStringOption {
        const option = new SlashCommandStringOption();
        this.optionBase(option);

        return option;
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

    public readonly name: string;
    public readonly name_localizations?: LocalizationMap;
    public readonly description: string;
    public readonly description_localizations?: LocalizationMap;
    public readonly args: A;
    private readonly executefn: (interaction: ChatInputCommandInteraction, args: ExtractArgs<A>) => unknown;

    constructor(options: {
        readonly name: string;
        readonly name_localizations?: LocalizationMap;
        readonly description: string;
        readonly description_localizations?: LocalizationMap;
        readonly args: A;
        readonly executefn: (interaction: ChatInputCommandInteraction, args: ExtractArgs<A>) => unknown;
    }) {
        this.name = options.name;
        this.name_localizations = options.name_localizations;
        this.description = options.description;
        this.description_localizations = options.description_localizations;
        this.args = options.args;
        this.executefn = options.executefn;
    }

    public builder(): SlashCommandBuilder {

        const builder = new SlashCommandBuilder();
        builder.setName(this.name);
        if(this.name_localizations) builder.setNameLocalizations(this.name_localizations);
        builder.setDescription(this.description);
        if(this.description_localizations) builder.setDescriptionLocalizations(this.description_localizations);

        for(const key in this.args) {
            const arg = this.args[key];

            const option = arg.option();
            option.setName(key);

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

            if(parsed[key] === undefined && !optional) {
                throw new Error('Argument is required');
            }

        }

        this.executefn(interaction, parsed);

    }

}





(async function() {
    
    const cmd = new Command({
        name: 'test',
        description: 'A testing command.',
        args: {
            test: new ArgNumber({
                description: 'testInt',
                type: 'integer',
                min: 0,
                max: 100
            }),
            message: new ArgString({
                description: 'testMsg'
            }).optional()
        },
        executefn: (interaction, args) => {
            
        }
    });

    console.log(cmd.builder().toJSON());

})();


