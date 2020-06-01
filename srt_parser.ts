import { $parseTime, $utfDecoder } from './util.ts';

interface srtData {
    start: number,
    end: number,
    text: string,
    num: number,
    time: string[]      // raw string
}

class SrtArray extends Array<srtData> {
    toText(): string {
        return toText(this);
    }
}

/**
 * Converts srt subtitles into array of objects
 */
export function srtParser(srtData: string | Uint8Array = ''): SrtArray {
    let srtString: string = typeof srtData === 'string' ? srtData : $utfDecoder(srtData);
    srtString = srtString.replace(/\r?\n/g, '\n').replace(/\n+$/, '');
    const result = new SrtArray();
    for (let segment of srtString.split(/\n{2,}(?=\d+)/)) {
        if(!!segment) {
            const lines: string[] = segment.split(/\n/);
            const num: number = +lines[0];
            const rawTime: string[] = lines[1].split(' --> ');
            const [ start = 0, end = 0 ] = rawTime.map($parseTime);
            const text: string = lines.slice(2).join("\n");
            result.push({
                num, start, end, text, time: rawTime
            });
        }
    }
    return result;
}

/**
 * extract text from srt subtitles
 */
export function srtToText(srtData: string | Uint8Array) {
    let ast: SrtArray = srtParser(srtData);
    return toText(ast);
}

function toText(ast: srtData[]): string {
    return ast.map(a => a.text).join('\n');
}
