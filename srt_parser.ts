import { $parseTime, $stripBom } from './util.ts';

interface ASTExpression {
    start: number,
    end: number,
    text: string,
    num: number,
    time: string[]      // raw string
}

/**
 * Converts srt subtitles into array of objects
 */
export function srtParser(srtString: string = ''): ASTExpression[] {
    srtString = $stripBom(srtString).replace(/\r?\n/g, '\n');
    return srtString.split(/\n{2,}/).filter(t => t).map(segment => {
        const lines: string[] = segment.split(/\n/);
        const num: number = +lines[0];
        const rawTime: string[] = lines[1].split(' --> ');
        const [ start, end ] = rawTime.map(t => $parseTime(t));
        const text: string = lines.slice(2).join("\n");
        return {
            num, start, end, text, time: rawTime
        };
    });
}

/**
 * extract text from srt subtitles
 */
export function srtToText(srtData: string | ASTExpression[]) {
    if(!srtData) {
        return '';
    }
    let ast: ASTExpression[] = typeof srtData === 'string' ? srtParser(srtData) : srtData;
    return ast.map(a => a.text).join('\n');
}
