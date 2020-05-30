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
