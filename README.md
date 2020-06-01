# Neta
[![ci](https://github.com/XiangnianZhou/neta/workflows/CI/badge.svg)](https://github.com/XiangnianZhou/neta/actions)

A SRT and ASS/SSA subtitle parser for Deno.

# Usage

```typescript
import { srtToText } from 'https://deno.land/x/neta/mod.ts';

const srt = await Deno.readTextFile('./test.srt');
const text = srtToText(srt);
await Deno.writeTextFile('./subtitle.txt', text);
```

Becuase APIs are not stable enough now, I recommend that you specify the version when you import Neta. like this:

```typescript
import { srtToText } from 'https://deno.land/x/neta@v0.5.1/mod.ts';
```

# API

* SRT
    * `srtParser()` Convert SRT string into array of objects
    * `srtToText()` extract text from SRT subtitle
* ASS/SSA
    * `assParser()` Convert ASS string to JSON
    * `assToSrt()` Convert ASS to SRT
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

# TODO

* [ ] Chinese documents;
* [ ] Parse SRT Formatting;
* [ ] Parse ASS override;
* [ ] Support Node.js;
