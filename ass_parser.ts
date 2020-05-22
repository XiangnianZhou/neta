import { $merge } from './util.ts';

export interface ScriptInfo {
    isComment: boolean;
    descriptor: string;
    info: string;
}

export interface Style {
    Name: string;
    Fontname: string;
    Fontsize: string;
    PrimaryColour: string;
    SecondaryColour: string;
    BackColour: string;
    Bold: string;
    Italic: string;
    StrikeOut: string;
    BorderStyle: string;
    Outline: string;
    Shadow: string;
    Alignment: string;
    MarginL: string;
    MarginR: string;
    MarginV: string;
    Encoding: string;
    OutlineColour?: string;
    TertiaryColour?: string;
    Underline?: string;
    ScaleX?: string;
    ScaleY?: string;
    Spacing?: string;
    Angle?: string;
    AlphaLevel?: string;
}

interface V4Styles {
    format: string[];
    styles: Style[];
}

export interface Event {
    Marked?: string;
    Layer?: string;
    Start: string;
    End: string;
    Style: string;
    Name: string;
    MarginL: string;
    MarginR: string;
    MarginV: string;
    Effect?: string;
    Text: {
        raw: string;
        data: {
            text: string;
            override: string;
        }[];
    };
}

interface Events {
    format: string[];
    list: Array<Event | { descriptor: string,  info: string }>;
}

export interface ASSJson {
    scriptInfo: ScriptInfo[];
    v4Styles: V4Styles;
    events: Events;
    // other sections: ASSJson[sectionName] = rawString
    [name: string]: ScriptInfo[] | V4Styles | Events | string;
}

interface SrtASTExpression {
    num: number;
    start: string;
    end: string;
    text: string;
}


// Converts ASSString ( E.g. Deno.readTextFileSync('t.ass') ) to JSON
export function assParser(assString: string = ''): ASSJson {
    if (!assString.startsWith('[Script Info]')) {
        throw 'ASS string should start with “[Script Info]”';
    }
    let scriptInfo: ScriptInfo[] = [];
    let v4Styles: V4Styles = {
        format:[],
        styles: []
    };
    let events: Events = {
        format: [],
        list: []
    };

    const sections = assString.split(/^\[(.*?)]\n/mg).slice(1);
    const otherSections: {[key: string]: string} = {};
    for(let i = 0; i < sections.length; i+= 2) {
        const sectionName = sections[i];
        const lines: string[] = sections[i + 1].split(/\r?\n/).filter(l => !/^\s*$/.test(l));
        
        if (sectionName === 'Script Info') {
            scriptInfo = parseInfo(lines);
        } else if (/V4\+? Styles/.test(sectionName)) {
            v4Styles = parseStyles(lines);
        } else if (sectionName === 'Events') {
            events = parseEvents(lines);
        } else {
            otherSections[sectionName] = sections[i + 1];
        }
    }
    return {
        scriptInfo, v4Styles, events, ...otherSections
    }
}

// Convert ASS to SRT
export function assToSrt(ass: ASSJson | string) {
    const srts = assToSrtAST(ass);
    return srts.map(segment => {
        const { start, num, end, text } = segment;
        return `${num}\n${start} --> ${end}\n${text}`;
    }).join('\n\n');
}

// Convert ASS to plain text
export function assToText(ass: ASSJson | string) {
    const list = assToSrtAST(ass);
    return list.map(segment => segment.text).join('\n');
}

// Convert Ass to AST of SRT
function assToSrtAST(ass: ASSJson | string): SrtASTExpression[] {
    if (typeof ass === 'string') {
        ass = assParser(ass);
    }
    return ass.events.list.filter(e => (<Event>e).Text).map((event, index) => {
        const dialogue = event as Event;
        const segmentText = dialogue.Text.data.filter(t => {
            return !/^(\s|\\n|\\N)*$/.test(t.text);
        }).map(t => {
            return t.text.replace(/\\h/g, '').split(/\\[nN]/)
        });
        return {
            num: index + 1,
            start: dialogue.Start,
            end: dialogue.End,
            text: segmentText.flat().join('\n')
        };
    });
}

// parse ScriptInfo section
function parseInfo(lines: string[]): ScriptInfo[] {
    return lines.map(line => {
        if (line.startsWith(';')) {
            return {
                descriptor: '',
                info: line,
                isComment: true,
            }
        }
        const [ descriptor, info= '' ] = line.split(':').map(l => l.trim());
        return {
            descriptor,
            info,
            isComment: false
        }
    });
}

// parse V4\+? Styles section
function parseStyles(lines: string[]): V4Styles {
    let format: string[] = [];
    let styles: Style[] = [];
    if (lines[0].startsWith('Format')) {
        lines = lines.map(l => l.replace(/^(.*?)\s*:\s*/, ''));
        format = lines[0].split(/\s*,\s*/);
        styles = lines.slice(1).map(line => {
            const style = $merge(format, line.split(/\s*,\s*/));
            return Object.assign({
                Name: '',
                Fontname: '',
                Fontsize: '',
                PrimaryColour: '',
                SecondaryColour: '',
                BackColour: '',
                Bold: '',
                Italic: '',
                StrikeOut: '',
                BorderStyle: '',
                Outline: '',
                Shadow: '',
                Alignment: '',
                MarginL: '',
                MarginR: '',
                MarginV: '',
                Encoding: ''
            }, style);
        });
    }
    return { format, styles };
}

// parse Events section
function parseEvents(lines: string[]): Events {
    let format: string[] = ["Layer", "Start", "End", "Style", "Name", "MarginL", "MarginR", "MarginV", "Effect", "Text"];
    let list: Events['list'] = [];
    const parsedLines = lines.map(line => {
        const found = line.match(/^([^\s:]+)\s*:\s*(.*)$/);
        return found && {
            descriptor: found[1],
            info: found[2]
        };
    }).filter(l => !!l);

    for (let i = 0, line; i < parsedLines.length, line = parsedLines[i]; i++) {
        if (line.descriptor === 'Format') {
            format = line.info.split(/\s*,\s*/);
        } else if (line.descriptor === 'Dialogue') {
            const fileds: string[] = line.info.split(/\s*,\s*/).slice(0, format.length - 1);
            const textReg: RegExp = new RegExp(`(?:[^,]*,){${fileds.length}}(.*)$`);
            const textMatch = line.info.match(textReg);
            const textContent: string = textMatch ? textMatch[1] : '';
            const parsedTexts: Event['Text']['data'] = [];
            const pairs: string[] = textContent.split(/{([^{}]*?)}/);
            if (pairs[0].length) {
                parsedTexts.push({
                    text: pairs[0],
                    override: ''
                });
            }
            for (let i = 1; i < pairs.length; i += 2) {
                parsedTexts.push({
                    text: pairs[i + 1] || '', 
                    override: pairs[i]
                });
            }

            let event: Event = Object.assign({
                Start: '',
                End: '',
                Style: '',
                Name: '',
                MarginL: '',
                MarginR: '',
                MarginV: '',
                Text: {
                    raw: textContent,
                    data: parsedTexts
                }
            }, $merge(format, [...fileds]));
            list.push(event);
        } else {
            list.push(line);
        }
    }

    return { format, list };
}


