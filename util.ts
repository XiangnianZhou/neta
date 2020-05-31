const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export function $parseTime(timeStr: string = ""): number {
    let match = timeStr.match(/(\d+):(\d+):(\d+),(\d+)/);
    match = match || Array(5).fill(0);
    const [,h, m, s, ms] = match.map((i) => +i);
    return h * HOUR + m * MINUTE + s * SECOND + ms;
}


export function $merge(keyArray: string[] = [], valueArray: any[] = []): object {
    const length = Math.min(keyArray.length, valueArray.length);
    let obj = Object.create(null);
    for(let i = 0; i < length; i++) {
        const key = keyArray[i];
        const value = valueArray[i];
        obj[key] = value;
    }
    return obj;
}


// export function $stripBom(fileContent: string): string {
//     if (fileContent.charCodeAt(0) === 0xFEFF) {
//         return fileContent.slice(1);
//     }
//     return fileContent;
// }

// decode utf8 and utf16
export function $utfDecoder(input: Uint8Array): string {
    const denoDecoder = new TextDecoder('utf-8', {
        ignoreBOM: true
    });
    const [ char1, char2 ] = input;
    const isUtf16LE = char1 === 0xff && char2 === 0xfe;
    const isUtf16BE = char1 === 0xfe && char2 === 0xff;
    if(isUtf16BE || isUtf16LE) {
        let result = '';
        for (let i = 2; i < input.length; i += 2) {
            const [ charL, charB ] = input.slice(i, i + 2).sort(() => +isUtf16BE);
            const code = charL | (charB << 8);
            result += String.fromCharCode(code);
        }
        return result;
    }
    return denoDecoder.decode(input);
}
