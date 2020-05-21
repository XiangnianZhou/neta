import { assertEquals } from './deps.ts';
import { srtParser, srtToText } from './srt_parser.ts';
import { assParser, assToText, assTosrt } from './ass_parser.ts';
import { 
    srtParser as srtPrserMod, 
    srtToText as srtToTextMod, 
    assParser as assParserMod, 
    assToText as assToTextMod, 
    assTosrt as assTosrtMod
} from './mod.ts';

Deno.test('exports nate APIs', (): void => {
    assertEquals(srtParser, srtPrserMod);
    assertEquals(srtToText, srtToTextMod);
    assertEquals(assParser, assParserMod);
    assertEquals(assToText, assToTextMod);
    assertEquals(assTosrt, assTosrtMod);
});
