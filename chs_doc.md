# Neta 🦕
[![ci](https://github.com/XiangnianZhou/neta/workflows/CI/badge.svg)](https://github.com/XiangnianZhou/neta/actions)

一个 Deno 平台的 SRT、ASS/SSA 字幕解析器。

# 快速使用

```typescript
import { srtToText } from 'https://deno.land/x/neta/mod.ts';

const srt = await Deno.readTextFile('./test.srt');
const text = srtToText(srt);
await Deno.writeTextFile('./subtitle.txt', text);
```

目前接口还不够稳定，建议引入 Neta 时，指定版本号，比如：

```typescript
import { srtToText } from 'https://deno.land/x/neta@v0.5.3/mod.ts';
```


# API

## srtParser
`function srtParser(srtData: string | Uint8Array): SrtArray`
解析 SRT 字幕，例子：

```js
const srtString = `1
00:00:00,001 --> 00:00:00,002
Five men is a juicy opportunity.
One man is a waste of ammo.

2
00:00:00,100 --> 00:00:00,200
<font color="#333333">Keep the <u>sand out</u> of your weapons!</font>`;

const ast = srtParser(srtString);
console.log(ast);
```

结果： 

```js
[
 {
   num: 1,  
   start: 1,
   end: 2,
   text: "Five men is a juicy opportunity.\nOne man is a waste of ammo.",
   time: [ "00:00:00,001", "00:00:00,002" ],
   children: [ 
       {
           node: "text", 
           children: [
               {
                    node: "text",
                    children: [ 
                        "Five men is a juicy opportunity.\nOne man is a waste of ammo." 
                    ]
                }
           ]
       } 
    ]
  },
 {
   num: 2,
   start: 100,
   end: 200,
   text: "Keep the sand out of your weapons!",
   time: [ "00:00:00,100", "00:00:00,200" ],
   children: [
        {
            node: "font",
            attr: { color: "#333333" },
            children: [
                {
                    node: "text",
                    children: [ "Keep the " ]
                },
                { 
                    node: "u",
                    children: [
                        {
                            node: "text",
                            children: [ "sand out" ]
                        }
                    ]
                },
                {
                    node: "text",
                    children: [ " of your weapons!" ]
                }
             ]
        }
    ]
  }
]
```

srtParser 除了可以接受字符串参数外，还可以接受一个 Uint8Array。当字幕需要从文件中读取，且不确定文件的编码方式时，需要使用此参数。

目前 Neta 支持解码 UTF8，UTF8 BOM，UTF16（UCS-2 BE 和 UCS-2 LE）。

```js
const subtitle = await Deno.readFile('x.srt');
const ast = srtParser(srtString);
```


