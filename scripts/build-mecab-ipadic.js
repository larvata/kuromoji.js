const fs = require('fs');
const IPADIC = require('mecab-ipadic-seed');
const kuromoji = require('../src/kuromoji.js');

const MECAB_IPADIC_DIRECTORY = 'dict';

if (!fs.existsSync(MECAB_IPADIC_DIRECTORY)) {
  fs.mkdirSync(MECAB_IPADIC_DIRECTORY);
}

// Convert Int32Array to Buffer
function toBuffer(typed) {
  return Buffer.from(typed.buffer);
}

const ipaDic = new IPADIC();
const builder = kuromoji.dictionaryBuilder();


// const posTypesMap = {
//   lastIndex: -1,
// };
const maskUslessFeatures = (line) => {
  // clear the usless features, it can reduce about 20% of the dict files
  const parts = line.split(',');

  // const pos = parts[4];
  // let posIndex = posTypesMap[pos];
  // if (posIndex === undefined) {
  //   posTypesMap.lastIndex += 1;
  //   posTypesMap[pos] = posTypesMap.lastIndex;
  //   posIndex = posTypesMap.lastIndex;
  // }

  // parts[0] = ''; // surface_form
  // parts[1] = ''; // left
  // parts[2] = ''; // right
  // parts[3] = ''; // cost
  // parts[4] = posIndex.toString(); // pos
  parts[5] = ''; // pos_detail_1
  parts[6] = ''; // pos_detail_2
  parts[7] = ''; // pos_detail_3
  parts[8] = ''; // conjugated_type
  parts[9] = ''; // conjugated_form
  parts[10] = ''; // basic_form
  // parts[11] = ''; // reading
  parts[12] = ''; // pronunciation

  return parts.join(',');
};

const addCustomTokenInfo = () => {
  const custom = [
    '令和,1288,1288,8142,名詞,固有名詞,一般,*,*,*,令和,レイワ,レイワ',
  ];

  custom.forEach((line) => {
    builder.addTokenInfoDictionary(maskUslessFeatures(line));
  });
};


// Build token info dictionary
const tokenInfoPromise = ipaDic.readTokenInfo((line) => {
  builder.addTokenInfoDictionary(maskUslessFeatures(line));
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
  addCustomTokenInfo();
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
