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


export interface Eelement {
    node: 'b' | 'u' | 'i' | 'font' | 'text' | 'line-position',
    children: Array<string|Eelement>,
    attr?: {
        [name: string]: string
    }
}

/**
 * parse srt formatting
 * 
 * 1. b,i,u, <b>…</b> or {b}…{/b}
 * 2. font <font color="color name or #code">…</font>
 * 3. Line position – {\a7}
 * https://en.wikipedia.org/wiki/SubRip
 */
export function $parseSrtFormatting(text: string): { children: Eelement[], text: string } {
    const stack: Eelement[] = [];
    const elems: Eelement[] = [];
    let plainText: string = '';
    let currentParent: Eelement|null = null;
    const startTagReg = /^[<{]\s*([biu])\s*[>}]/i;
    const attrReg = /(\w+)\s*=\s*"?([-\w#_ ]+)"?\s*/;
    const fontStartTagReg = new RegExp(`^<\\s*(font)\\s*(${attrReg.source})+>`, 'i');
    const linePositionReg = /{\\a(\d+)}/i;
    const endTagReg = /^[<{]\/\s*([biu])\s*[>}]/i;
    const fontEngTagReg = /^<\/\s*(font)\s*>/i;
    while (text.length > 0) {
        // Line position
        let ischars = true;
        if(text.startsWith('{\\a')) {
            const match = text.match(linePositionReg);
            if (match) {
                text = text.substring(match[0].length);
                elems.push({
                    node: 'line-position',
                    children: [ match[1] ]
                });
                ischars = false;
            }
        // end tag
        } else if (/^[{<}]\//.test(text)) {
            const match = text.match(endTagReg) || text.match(fontEngTagReg);
            if (match) {
                stack.length -= 1
                currentParent = stack[stack.length - 1];
                text = text.substring(match[0].length);
                ischars = false;
            }
        // start tag
        } else if (/^[<{]/.test(text)) {
            const match = text.match(startTagReg) || text.match(fontStartTagReg);
            if (match) {
                const elem: Eelement = {
                    node: <Eelement['node']>match[1].toLowerCase(),
                    children: []
                }

                // parse attr
                if (match.length > 2) {
                    elem.attr = {};
                    let attrs = match[2];
                    let attrMatch;
                    while(attrMatch = attrs.match(attrReg)) {
                        elem.attr[attrMatch[1]] = attrMatch[2];
                        attrs = attrs.substring(attrMatch[0].length);
                    }
                }
                text = text.substring(match[0].length);
                if (currentParent) {
                    currentParent.children.push(elem);
                } else {
                    elems.push(elem);
                }
                stack.push(elem);
                currentParent = elem;
                
                ischars = false;
            }
        }

        // chars
        if (ischars) {
            let index = text.indexOf('<');
            let rest = '', next = 0;
            if (index >= 0) {
                rest = text.slice(index);
                while (
                    !endTagReg.test(rest) &&
                    !startTagReg.test(rest) &&
                    !fontEngTagReg.test(rest) &&
                    !fontStartTagReg.test(rest)
                ) {
                    // "<" in plain text, be forgiving and treat it as text
                    next = rest.indexOf('<', 1);
                    if (next < 0) { break }
                    index += next;
                    rest = text.slice(index);
                }
            }

            const chars = index < 0 ? text : text.substring(0, index);
            text = index < 0 ? '' : text.substring(index);
            plainText += chars;
            (currentParent ? currentParent.children : elems).push({
                node: 'text',
                children: [ chars ]
            });
        }
    }

    return {
        children: elems,
        text: plainText
    }
}