import { assertEquals } from './deps.ts';
import { srtParser, srtToText } from './srt_parser.ts';
import { assParser, assToText, assToSrt } from './ass_parser.ts';
import { 
    srtParser as srtPrserMod, 
    srtToText as srtToTextMod, 
    assParser as assParserMod, 
    assToText as assToTextMod, 
    assToSrt as assToSrtMod
} from './mod.ts';

Deno.test('exports nate APIs', (): void => {
    assertEquals(srtParser, srtPrserMod);
    assertEquals(srtToText, srtToTextMod);
    assertEquals(assParser, assParserMod);
    assertEquals(assToText, assToTextMod);
    assertEquals(assToSrt, assToSrtMod);
});
