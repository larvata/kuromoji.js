const fs = require('fs');
const IPADIC = require('mecab-ipadic-seed');
const kuromoji = require('../src/kuromoji.js');

const MECAB_IPADIC_DIRECTORY = 'dict';

if (!fs.existsSync(MECAB_IPADIC_DIRECTORY)) {
  fs.mkdirSync(MECAB_IPADIC_DIRECTORY);
}

// To node.js Buffer
function toBuffer(typed) {
  const ab = typed.buffer;
  const buffer = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; i += 1) {
    buffer[i] = view[i];
  }
  return buffer;
}

const ipaDic = new IPADIC();
const builder = kuromoji.dictionaryBuilder();

// Build token info dictionary
const tokenInfoPromise = ipaDic.readTokenInfo((line) => {
  builder.addTokenInfoDictionary(line);
}).then(() => {
  console.log('Finishied to read token info dics');
});

// Build connection costs matrix
const matrixDefPromise = ipaDic.readMatrixDef((line) => {
  builder.putCostMatrixLine(line);
}).then(() => {
  console.log('Finishied to read matrix.def');
});

// Build unknown dictionary
const unkDefPromise = ipaDic.readUnkDef((line) => {
  builder.putUnkDefLine(line);
}).then(() => {
  console.log('Finishied to read unk.def');
});

// Build character definition dictionary
const charDefPromise = ipaDic.readCharDef((line) => {
  builder.putCharDefLine(line);
}).then(() => {
  console.log('Finishied to read char.def');
});

// Build kuromoji.js binary dictionary
Promise.all([
  tokenInfoPromise,
  matrixDefPromise,
  unkDefPromise,
  charDefPromise,
]).then(() => {
  console.log('Finishied to read all seed dictionary files');
  console.log('Building binary dictionary ...');
  return builder.build();
}).then((dic) => {
  const base_buffer = toBuffer(dic.trie.bc.getBaseBuffer());
  const check_buffer = toBuffer(dic.trie.bc.getCheckBuffer());
  const token_info_buffer = toBuffer(dic.token_info_dictionary.dictionary.buffer);
  const tid_pos_buffer = toBuffer(dic.token_info_dictionary.pos_buffer.buffer);
  const tid_map_buffer = toBuffer(dic.token_info_dictionary.targetMapToBuffer());
  const connection_costs_buffer = toBuffer(dic.connection_costs.buffer);
  const unk_buffer = toBuffer(dic.unknown_dictionary.dictionary.buffer);
  const unk_pos_buffer = toBuffer(dic.unknown_dictionary.pos_buffer.buffer);
  const unk_map_buffer = toBuffer(dic.unknown_dictionary.targetMapToBuffer());
  const char_map_buffer = toBuffer(dic.unknown_dictionary.character_definition.character_category_map);
  const char_compat_map_buffer = toBuffer(dic.unknown_dictionary.character_definition.compatible_category_map);
  const invoke_definition_map_buffer = toBuffer(dic.unknown_dictionary.character_definition.invoke_definition_map.toBuffer());

  fs.writeFileSync('dict/base.dat', base_buffer);
  fs.writeFileSync('dict/check.dat', check_buffer);
  fs.writeFileSync('dict/tid.dat', token_info_buffer);
  fs.writeFileSync('dict/tid_pos.dat', tid_pos_buffer);
  fs.writeFileSync('dict/tid_map.dat', tid_map_buffer);
  fs.writeFileSync('dict/cc.dat', connection_costs_buffer);
  fs.writeFileSync('dict/unk.dat', unk_buffer);
  fs.writeFileSync('dict/unk_pos.dat', unk_pos_buffer);
  fs.writeFileSync('dict/unk_map.dat', unk_map_buffer);
  fs.writeFileSync('dict/unk_char.dat', char_map_buffer);
  fs.writeFileSync('dict/unk_compat.dat', char_compat_map_buffer);
  fs.writeFileSync('dict/unk_invoke.dat', invoke_definition_map_buffer);
}).then(() => {
  console.log('Dict built from mecab-ipadic-seed done.');
});
