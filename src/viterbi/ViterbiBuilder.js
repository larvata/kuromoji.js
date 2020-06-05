/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const ViterbiNode = require('./ViterbiNode');
const ViterbiLattice = require('./ViterbiLattice');
const SurrogateAwareString = require('../util/SurrogateAwareString');

class ViterbiBuilder {
  /**
   * ViterbiBuilder builds word lattice (ViterbiLattice)
   * @param {DynamicDictionaries} dic dictionary
   * @constructor
   */
  constructor(dic) {
    this.trie = dic.trie;
    this.token_info_dictionary = dic.token_info_dictionary;
    this.unknown_dictionary = dic.unknown_dictionary;
  }

  /**
   * Build word lattice
   * @param {string} sentence_str Input text
   * @returns {ViterbiLattice} Word lattice
   */
  build(sentence_str) {
    const lattice = new ViterbiLattice();
    const sentence = new SurrogateAwareString(sentence_str);

    for (let pos = 0; pos < sentence.length; pos += 1) {
      const tail = sentence.slice(pos);
      const vocabulary = this.trie.commonPrefixSearch(tail);
      for (let n = 0; n < vocabulary.length; n += 1) {
        // Words in dictionary do not have surrogate pair (only UCS2 set)
        const trie_id = vocabulary[n].v;
        const key = vocabulary[n].k;

        const token_info_ids = this.token_info_dictionary.target_map[trie_id];
        for (let i = 0; i < token_info_ids.length; i += 1) {
          const token_info_id = parseInt(token_info_ids[i], 10);

          const left_id = this.token_info_dictionary.dictionary.getShort(token_info_id);
          const right_id = this.token_info_dictionary.dictionary.getShort(token_info_id + 2);
          const word_cost = this.token_info_dictionary.dictionary.getShort(token_info_id + 4);

          // node_name, cost, start_index, length, type, left_id, right_id, surface_form
          lattice.append(new ViterbiNode(token_info_id, word_cost, pos + 1, key.length, 'KNOWN', left_id, right_id, key));
        }
      }

      // Unknown word processing
      const surrogate_aware_tail = new SurrogateAwareString(tail);
      const head_char = new SurrogateAwareString(surrogate_aware_tail.charAt(0));
      const head_char_class = this.unknown_dictionary.lookup(head_char.toString());
      if (vocabulary == null || vocabulary.length === 0 || head_char_class.is_always_invoke === 1) {
        // Process unknown word
        let key = head_char;
        if (head_char_class.is_grouping === 1 && surrogate_aware_tail.length > 1) {
          for (let k = 1; k < surrogate_aware_tail.length; k += 1) {
            const next_char = surrogate_aware_tail.charAt(k);
            const next_char_class = this.unknown_dictionary.lookup(next_char);
            if (head_char_class.class_name !== next_char_class.class_name) {
              break;
            }
            key += next_char;
          }
        }

        const unk_ids = this.unknown_dictionary.target_map[head_char_class.class_id];
        for (let j = 0; j < unk_ids.length; j += 1) {
          const unk_id = parseInt(unk_ids[j], 10);

          const left_id = this.unknown_dictionary.dictionary.getShort(unk_id);
          const right_id = this.unknown_dictionary.dictionary.getShort(unk_id + 2);
          const word_cost = this.unknown_dictionary.dictionary.getShort(unk_id + 4);

          // node_name, cost, start_index, length, type, left_id, right_id, surface_form
          lattice.append(new ViterbiNode(unk_id, word_cost, pos + 1, key.length, 'UNKNOWN', left_id, right_id, key.toString()));
        }
      }
    }
    lattice.appendEos();

    return lattice;
  }
}


module.exports = ViterbiBuilder;
