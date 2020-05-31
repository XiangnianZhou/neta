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

Deno.test('srtParser: input UTF-16 Uint8Array', (): void => {
    let str = Deno.readFileSync('./test.srt');
    const actual = srtParser(str);
    assertEquals(actual, parserExpected);
});

Deno.test('srt string to text', (): void => {
    const mockSrt = '1\n00:00:00,001 --> 00:00:00,002\nFive men is a juicy opportunity.\nOne man is a waste of ammo.';
    const expected = 'Five men is a juicy opportunity.\nOne man is a waste of ammo.';
    const actral = srtToText(mockSrt);
    assertEquals(actral, expected);
    assertEquals(srtParser(mockSrt).toText(), expected);
});

Deno.test('srt blank lines', (): void => {
    const mockSrt = '1\n00:00:00,001 --> 00:00:00,002\n\n\n2\n00:01:00,001 --> 00:02:00,002\nOne\n\n';
    const actual = srtParser(mockSrt);
    assertEquals(actual[0].text, '');
    assertEquals(actual[1].text, 'One');
    assertEquals(actual.length, 2);
});
