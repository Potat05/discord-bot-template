
import { ChatInputCommandInteraction, AutocompleteInteraction, LocalizationMap, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandStringOption, ApplicationCommandOptionBase, ApplicationCommandOptionWithChoicesAndAutocompleteMixin, SlashCommandBooleanOption, User, SlashCommandUserOption } from "discord.js";
import { Awaitable, Constructor } from "./Types";



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



    protected optionBase<T extends ApplicationCommandOptionBase>(optionConstructor: Constructor<T>): T {
        const option = new optionConstructor();

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

    public abstract validate(value: Type): boolean;

}



class ArgNumber<Required extends boolean, Default extends number | undefined> extends ArgBase<number, Required, Default, number> {

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
        // Typescript is doodoo and forces me to do it this way.
        const option = this.type == 'number' ? this.optionBase(SlashCommandNumberOption) : this.optionBase(SlashCommandIntegerOption);

        if(this.min !== undefined) option.setMinValue(this.min);
        if(this.max !== undefined) option.setMaxValue(this.max);

        return option;
    }

    public validate(value: number): boolean {
        if(Number.isNaN(value)) return false;
        if(this.min !== undefined && value < this.min) return false;
        if(this.max !== undefined && value > this.max) return false;
        if(this.type == 'integer' && !Number.isInteger(value)) return false;
        return true;
    }

}

class ArgString<Required extends boolean, Default extends string | undefined> extends ArgBase<string, Required, Default, string> {

    public readonly minLength?: number;
    public readonly maxLength?: number;

    constructor(options: {
        readonly minLength?: number;
        readonly maxLength?: number;
    } & ArgBaseConstructorOptions<string, Required, Default, string>) {
        super(options);

        this.minLength = options.minLength;
        this.maxLength = options.maxLength;
    }

    public option(): SlashCommandStringOption {
        const option = this.optionBase(SlashCommandStringOption);

        if(this.minLength !== undefined) option.setMinLength(this.minLength);
        if(this.maxLength !== undefined) option.setMaxLength(this.maxLength);

        return option;
    }

    public validate(value: string): boolean {
        if(this.minLength !== undefined && value.length < this.minLength) return false;
        if(this.maxLength !== undefined && value.length > this.maxLength) return false;
        return true;
    }

}

class ArgBoolean<Required extends boolean, Default extends boolean | undefined> extends ArgBase<boolean, Required, Default, undefined> {

    constructor(options: {

    } & ArgBaseConstructorOptions<boolean, Required, Default, undefined>) {
        super(options);
    }

    public option(): SlashCommandBooleanOption {
        return this.optionBase(SlashCommandBooleanOption);
    }

    public validate(value: boolean): boolean {
        return true;
    }

}

class ArgUser<Required extends boolean, Default extends undefined = undefined> extends ArgBase<User, Required, Default, undefined> {

    constructor(options: {

    } & ArgBaseConstructorOptions<User, Required, Default, undefined>) {
        super(options);
    }

    public option(): SlashCommandUserOption {
        return this.optionBase(SlashCommandUserOption);
    }

    public validate(value: User): boolean {
        return true;
    }

}



export namespace Arg {
    export const Number = ArgNumber;
    export const String = ArgString;
    export const Boolean = ArgBoolean;
    export const User = ArgUser;
}



type ArgType =
    ArgNumber<any, any> |
    ArgString<any, any> |
    ArgBoolean<any, any> |
    ArgUser<any, any>;



type GetArgType<Arg extends ArgBase<any, any, any, any>> =
    Arg extends ArgNumber<infer Required, infer Default> ? (Required extends true ? number : number | Default) :
    Arg extends ArgString<infer Required, infer Default> ? (Required extends true ? string : string | Default) :
    Arg extends ArgBoolean<infer Required, infer Default> ? (Required extends true ? boolean : boolean | Default) :
    Arg extends ArgUser<infer Required, infer Default> ? (Required extends true ? User : User | Default) :
    never;



type ExtractArgs<A> = 
    A extends {[key: string]: ArgType} ? {
        [Key in keyof A]: GetArgType<A[Key]>;
    } : never;



export class Command<A extends {[key: string]: unknown} = {[key: string]: unknown}> {

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

            let value: any | null = null;

            const getfn = (
                (arg instanceof ArgNumber) ? (arg.type == 'integer' ? opts.getInteger : opts.getNumber) :
                (arg instanceof ArgString) ? opts.getString :
                (arg instanceof ArgBoolean) ? opts.getBoolean :
                (arg instanceof ArgUser) ? opts.getUser :
                null
            );

            if(getfn === null) {
                throw new Error('Invalid argument type.');
            }

            value = getfn(key);


            if(arg.required) {
                if(value === null) {
                    throw new Error('Argument is required');
                }

                parsed[key] = value;
            } else {

                if(arg.default !== undefined) {
                    value ??= arg.default;
                }

                if(value === null) continue;

                if(!arg.validate(value)) {
                    throw new Error('Argument validation failed.');
                }

                parsed[key] = value;
            }
        }

        this.executefn(interaction, parsed);

    }

}


