# neta
[![ci](https://github.com/XiangnianZhou/neta/workflows/CI/badge.svg)](https://github.com/XiangnianZhou/neta/actions)

A SRT and ASS/SSA  subtitle parser for Deno.


# API

* SRT
    *  `srtParser()` Converts srt subtitles into array of objects
    * `srtToText()` extract text from srt subtitle
* ASS/SSA
    * `assParser()` Converts ASSString ( E.g. Deno.readTextFileSync('t.ass') ) to JSON
    * `assTosrt()` Convert ASS to SRT
    * `assToText()` Convert ASS to plain text

# Example


```js
const srtString = `1
00:00:00,001 --> 00:00:00,002
Five men is a juicy opportunity.
One man is a waste of ammo.

2
00:00:00,100 --> 00:00:00,200
Keep the sand out of your weapons!`;

const ast = srtParser(srtString);
console.log(ast);
```
