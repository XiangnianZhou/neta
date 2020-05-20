import { assertEquals } from './deps.ts';
import { srtParser, srtToText } from './srt_parser.ts';

const parserExpected = [
    {
        num: 1,
        start: 1,
        end: 2,
        text: 'Five men is a juicy opportunity.\nOne man is a waste of ammo.',
        time: ['00:00:00,001', '00:00:00,002']
    }, {
        num: 2,
        start: 100,
        end: 200,
        text: 'Keep the sand out of your weapons!',
        time: ['00:00:00,100', '00:00:00,200']
    }
];

Deno.test('srtParser: multiline text & sigle line text', (): void => {
    let mockSrt = '1\n00:00:00,001 --> 00:00:00,002\nFive men is a juicy opportunity.\nOne man is a waste of ammo.';
    mockSrt += '\n\n2\n00:00:00,100 --> 00:00:00,200\nKeep the sand out of your weapons!';
    const actual = srtParser(mockSrt);
    assertEquals(actual, parserExpected);
});

Deno.test('srtParser: text separated by \\r\\n', (): void => {
    let mockSrt = '1\r\n00:00:00,001 --> 00:00:00,002\r\nFive men is a juicy opportunity.\r\nOne man is a waste of ammo.';
    mockSrt += '\r\n\r\n2\n00:00:00,100 --> 00:00:00,200\r\nKeep the sand out of your weapons!';
    const actual = srtParser(mockSrt);
    assertEquals(actual, parserExpected);
});

Deno.test('srt string to text', (): void => {
    const srt = '1\n00:00:00,001 --> 00:00:00,002\nFive men is a juicy opportunity.\nOne man is a waste of ammo.';
    const expected = 'Five men is a juicy opportunity.\nOne man is a waste of ammo.';
    const actral = srtToText(srt);
    assertEquals(actral, expected);
});

Deno.test('srt AST to text', (): void => {
    const srt = parserExpected;
    const expected = 'Five men is a juicy opportunity.\nOne man is a waste of ammo.\nKeep the sand out of your weapons!';
    const actral = srtToText(srt);
    assertEquals(actral, expected);
});
