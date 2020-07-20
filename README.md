# kuromoji.js

JavaScript implementation of Japanese morphological analyzer.
This is a pure JavaScript porting of [Kuromoji](https://www.atilika.com/ja/kuromoji/).

This is the fork of [takuyaa/kuromoji.js](https://github.com/takuyaa/kuromoji.js)


## Updates to original package

- rewrited with es6, promise

- removed the zlib

- supports loading dicts from url


## Usage

Build dictionary data from IPADIC:
```
npm run build-dict
```

Build the module:
```
npm run build
```


## Directory

Directory tree is as follows:

    build/
      kuromoji.js -- JavaScript file for browser (Browserified)
    demo/         -- Demo
    dict/         -- Dictionaries for tokenizer (gzipped)
    example/      -- Examples to use in Node.js
    src/          -- JavaScript source
    test/         -- Unit test


## Usage

You can tokenize sentences with only 5 lines of code.
If you need working examples, you can see the files under the demo or example directory.


### Node.js

Load this library as follows:

    var kuromoji = require("./kuromoji");

You can prepare tokenizer like this:

    kuromoji.builder({ dicPath: "path/to/dictionary/dir/" }).build()
        .then((tokenizer) => {
            // tokenizer is ready
            const path = tokenizer.tokenize("すもももももももものうち");
            console.log(path);
        }).catch(err => console.log(err));



### Browser

You only need the dist/kuromoji.js and dict/*.dat files

    <script src="url/to/kuromoji.js"></script>

In your JavaScript:

    kuromoji.builder({ dicPath: "/url/to/dictionary/dir/" }).build(function (err, tokenizer) {
        // tokenizer is ready
        var path = tokenizer.tokenize("すもももももももものうち");
        console.log(path);
    });


## API

The function tokenize() returns an JSON array like this:

    [ {
        word_id: 509800,          // 辞書内での単語ID
        word_type: 'KNOWN',       // 単語タイプ(辞書に登録されている単語ならKNOWN, 未知語ならUNKNOWN)
        word_position: 1,         // 単語の開始位置
        surface_form: '黒文字',    // 表層形
        pos: '名詞',               // 品詞
        pos_detail_1: '一般',      // 品詞細分類1
        pos_detail_2: '*',        // 品詞細分類2
        pos_detail_3: '*',        // 品詞細分類3
        conjugated_type: '*',     // 活用型
        conjugated_form: '*',     // 活用形
        basic_form: '黒文字',      // 基本形
        reading: 'クロモジ',       // 読み
        pronunciation: 'クロモジ'  // 発音
      } ]

(This is defined in src/util/IpadicFormatter.js)

See also [JSDoc page](https://takuyaa.github.io/kuromoji.js/jsdoc/) in details.
