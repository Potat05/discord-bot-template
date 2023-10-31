
import { ChatInputCommandInteraction, AutocompleteInteraction, LocalizationMap, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandStringOption, ApplicationCommandOptionBase, ApplicationCommandOptionWithChoicesAndAutocompleteMixin, SlashCommandBooleanOption } from "discord.js";



type Awaitable<T> = Promise<T> | T;



type ChoiceType<T extends string | number | undefined> = 
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



interface ArgBaseConstructorOptions<Type, Required extends boolean, Default extends Type | undefined, Autocomplete extends string | number | undefined> {
    readonly required?: Required;
    readonly default?: (Required extends true ? never : Default);
    
    /** This is set from the key in the arg object. */
    readonly name?: never;
    readonly name_localizations?: LocalizationMap;
    readonly description: string;
    readonly description_localizations?: LocalizationMap;

    readonly choices?: (Autocomplete extends undefined ? never : ChoiceType<Autocomplete>[]);
    readonly autocomplete?: (Autocomplete extends undefined ? never : (interaction: AutocompleteInteraction) => Awaitable<ChoiceType<Autocomplete>[]>);
}

abstract class ArgBase<Type, Required extends boolean, Default extends Type | undefined, Autocomplete extends string | number | undefined> {
    readonly required?: Required;
    readonly default?: (Required extends true ? never : Default);

    public readonly name?: never;
    public readonly name_localizations?: LocalizationMap;
    public readonly description: string;
    public readonly description_localizations?: LocalizationMap;

    public readonly choices?: (Autocomplete extends undefined ? never : ChoiceType<Autocomplete>[]);
    public readonly autocomplete?: (Autocomplete extends undefined ? never : (interaction: AutocompleteInteraction) => Awaitable<ChoiceType<Autocomplete>[]>);

    constructor(options: ArgBaseConstructorOptions<Type, Required, Default, Autocomplete>) {
        this.required = options.required;
        this.default = options.default;

        this.name = options.name;
        this.name_localizations = options.name_localizations;
        this.description = options.description;
        this.description_localizations = options.description_localizations;

        this.choices = options.choices;
        this.autocomplete = options.autocomplete;
    }



    protected optionBase<T extends ApplicationCommandOptionBase>(option: T): T {
        if(this.name_localizations) option.setDescriptionLocalizations(this.name_localizations);
        option.setDescription(this.description);
        if(this.description_localizations) option.setDescriptionLocalizations(this.description_localizations);

        option.setRequired(this.required ?? false);

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

        return option;
    }
    public abstract option(): ApplicationCommandOptionBase;

}



export class ArgNumber<Required extends boolean, Default extends number | undefined> extends ArgBase<number, Required, Default, number> {
    public readonly type: 'number' | 'integer';
    public readonly min?: number;
    public readonly max?: number;

    constructor(options: {
        readonly type: 'number' | 'integer';
        readonly min?: number;
        readonly max?: number;
    } & ArgBaseConstructorOptions<number, Required, Default, number>) {
        super(options);
        this.type = options.type;
        this.min = options.min;
        this.max = options.max;
    }

    public option(): SlashCommandNumberOption | SlashCommandIntegerOption {
        const option = new (this.type == 'number' ? SlashCommandNumberOption : SlashCommandIntegerOption)();
        this.optionBase(option);

        if(this.min !== undefined) option.setMinValue(this.min);
        if(this.max !== undefined) option.setMaxValue(this.max);

        return option;
    }

}

export class ArgString<Required extends boolean, Default extends string | undefined> extends ArgBase<string, Required, Default, string> {

    constructor(options: {

    } & ArgBaseConstructorOptions<string, Required, Default, string>) {
        super(options);

    }

    public option(): SlashCommandStringOption {
        const option = new SlashCommandStringOption();
        this.optionBase(option);

        return option;
    }

}

export class ArgBoolean<Required extends boolean, Default extends boolean | undefined> extends ArgBase<boolean, Required, Default, undefined> {

    constructor(options: {

    } & ArgBaseConstructorOptions<boolean, Required, Default, undefined>) {
        super(options);

    }

    public option(): SlashCommandBooleanOption {
        const option = new SlashCommandBooleanOption();
        this.optionBase(option);

        return option;
    }

}



type ArgType = ArgNumber<any, any> | ArgString<any, any> | ArgBoolean<any, any>;



type GetArgType<Arg extends ArgBase<any, any, any, any>> =
    Arg extends ArgNumber<infer Required, infer Default> ? (Required extends true ? number : number | Default) :
    Arg extends ArgString<infer Required, infer Default> ? (Required extends true ? string : string | Default) :
    Arg extends ArgBoolean<infer Required, infer Default> ? (Required extends true ? boolean : boolean | Default) :
    never;



type ExtractArgs<A> = 
    A extends {[key: string]: ArgType} ? {
        [Key in keyof A]: GetArgType<A[Key]>;
    } : never;



export class Command<A extends {[key: string]: unknown}> {

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
            if(!(arg instanceof ArgBase)) {
                throw new Error('Invalid arg type.');
            }

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
            const arg = this.args[key];
            if(!(arg instanceof ArgBase)) {
                throw new Error('Invalid arg type.');
            }

            if(arg instanceof ArgNumber) {
                const num = arg.type == 'integer' ? opts.getInteger(key) : opts.getInteger(key);
                // @ts-ignore
                if(num) parsed[key] = num ?? arg.default;
            } else {
                throw new Error('Invalid argument type.');
            }

            if(parsed[key] === undefined && arg.required) {
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
            msg: new ArgString({
                required: true,
                description: 'testStr'
            }),
            bool: new ArgBoolean({
                description: 'testBool',
                required: false,
                default: true
            })
        },
        executefn: (interaction, args) => {
            args.test
            args.msg
            args.bool
        }
    });

    console.log(cmd.builder().toJSON());

})();


