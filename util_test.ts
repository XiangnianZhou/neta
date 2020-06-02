import { $parseTime, $merge, $utfDecoder, $parseSrtFormatting } from './util.ts';
import { assertEquals } from './deps.ts';

Deno.test('util.parseTime()', (): void => {
    const timeStr = '01:02:05,500';
    const expected = ((60 + 2) * 60 + 5) * 1000 + 500;
    const actual = $parseTime(timeStr);
    assertEquals(actual, expected);
});

Deno.test('util.merge()', (): void => {
    const arr1 = ['key1', 'key2', 'key3'];
    const arr2 = ['v1', 'v2', 'v3'];
    const actual = $merge(arr1, arr2);
    const expected = {
        key1: 'v1',
        key2: 'v2',
        key3: 'v3'
    }
    assertEquals(actual, expected);
});


Deno.test('util.$utfDecoder()', (): void => {
    const dataUcs2BE = new Uint8Array([254, 255,  0, 49,   0, 48, 78,7, 255, 12, 81, 107, 83, 67, 145, 204,  0, 63]);
    const dataUcs2LE = new Uint8Array([255, 254,  49,   0, 48,  0,  7,78,  12, 255, 107, 81, 67, 83, 204, 145,  63,   0]);
    const dataUtf8Bom = new Uint8Array([239, 187, 191,  49,  48, 228, 184, 135, 239, 188, 140, 229, 133, 171, 229, 141, 131, 233, 135, 140, 63]);
    const dataUtf8 = new Uint8Array([49,  48, 228, 184, 135, 239, 188, 140, 229, 133, 171, 229, 141, 131, 233, 135, 140, 63]);

    const actualUcs2BE = $utfDecoder(dataUcs2BE);
    const actualUcs2LE = $utfDecoder(dataUcs2LE);
    const actualUtf8Bom = $utfDecoder(dataUtf8Bom);
    const actualUtf8 = $utfDecoder(dataUtf8);
    const expected = '10万，八千里?';
    
    assertEquals(actualUcs2BE, expected);
    assertEquals(actualUcs2LE, expected);
    assertEquals(actualUtf8Bom, expected);
    assertEquals(actualUtf8, expected);
});


Deno.test('util.$parseSrtFormatting()', (): void => {
    // i just wanna run
    const linePositionStr = `{\\a7}`;
    assertEquals($parseSrtFormatting(linePositionStr).children[0], {
        node: 'line-position',
        children: ['7']
    });

    const chars = 'I just wanna\n run';
    assertEquals($parseSrtFormatting(chars).children[0], {
        node: 'text',
        children: ['I just wanna\n run']
    });

    const fontTag = '<font color=#ff0000>I just wanna run</font>';
    assertEquals($parseSrtFormatting(fontTag).children[0], {
        node: 'font',
        children: [
            {
                node: 'text',
                children: ['I just wanna run']
            }
        ],
        attr: { color: "#ff0000" }
    });

    const tags = '<b>I just <wanna> \nrun</b>';
    assertEquals($parseSrtFormatting(tags).children[0], {
        node: 'b',
        children: [
            {
                node: 'text',
                children: ['I just <wanna> \nrun']
            }
        ]
    });

    const multiTags = '<i>I just <wanna></i><b> run</b>';
    assertEquals($parseSrtFormatting(multiTags).children, [
        {
            node: 'i',
            children: [
                {
                    node: 'text',
                    children: ['I just <wanna>']
                }
            ]
        },
        {
            node: 'b',
            children: [
                {
                    node: 'text',
                    children: [' run']
                }
            ]
        }
    ]);

    const nestedTags = '<b>I just <u>wanna</u> run</b>';
    assertEquals($parseSrtFormatting(nestedTags).children[0].children, [
        {
            node: 'text',
            children: ['I just ']
        }, 
        {
            node: 'u',
            children: [
                {
                    node: 'text',
                    children: ['wanna']
                }
            ]
        },
        {
            node: 'text',
            children: [' run']
        }
    ]);
});
