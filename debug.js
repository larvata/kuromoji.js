const fs = require('fs');

const kuromoji = require('./src/kuromoji.js');
const Tokenizer = require('./src/Tokenizer');
const CharacterDefinitionBuilder = require('./src/dict/builder/CharacterDefinitionBuilder');

// const DIC_DIR = 'dict/';
const DIC_DIR = './test/resource/minimum-dic/';

// const result = Tokenizer.splitByPunctuation('すもももももももものうち');
// console.log(result);


// kuromoji.builder({ dicPath: DIC_DIR }).build((_tokenizer) => {
//   const result = _tokenizer.tokenize('すもももももももものうち');
//   console.log(result);
// });


const cd_builder = new CharacterDefinitionBuilder();
fs.readFileSync(`${DIC_DIR}char.def`, 'utf-8')
  .split('\n')
  .forEach((line) => {
    cd_builder.putLine(line);
  });
const char_def = cd_builder.build();

console.log(char_def.lookup('日'));
