


export function truncateString(str: string, maxLength: number): string {
    const bottomIndex = Math.floor(maxLength / 2);
    const topIndex = str.length - Math.ceil(maxLength / 2);

    // String fits inside maxLength.
    if(topIndex < bottomIndex) return str;

    const bottom = str.slice(0, bottomIndex - 3);
    const top = str.slice(topIndex + 2, str.length);

    return `${bottom} ... ${top}`;
}



export function editDistance(value: string, other: string, insensitive: boolean = true): number {
    if(value == other) return 0;
    if(value.length == 0) return other.length;
    if(other.length == 0) return value.length;

    const codes: number[] = [];
    const cache: number[] = [];

    if(insensitive) {
        value = value.toLowerCase();
        other = other.toLowerCase();
    }

    let index: number = 0;

    while(index < value.length) {
        codes[index] = value.charCodeAt(index);
        cache[index] = ++index;
    }

    let indexOther: number = 0;
    let result: number = -1;

    while(indexOther < other.length) {
        const code = other.charCodeAt(indexOther);
        let index: number = -1;
        let distance: number = indexOther++;
        result = distance;

        while(++index < value.length) {
            const distanceOther = code == codes[index] ? distance : distance + 1;
            distance = cache[index];
            result = 
                (distance > result)
                  ? (distanceOther > result)
                    ? result + 1
                    : distanceOther
                  : (distanceOther > distance)
                    ? distance + 1
                    : distanceOther
            cache[index] = result;
        }
    }

    return result;

}



export function querySearchAutocomplete(values: string[], term: string, limit: number = Infinity): string[] {
        
    values = values.filter(value => {
        const split = value.split(/[^\w]|_/g);
        return split.some(str => str.startsWith(term));
    });

    values = values.sort();

    return values.slice(0, limit);

}


