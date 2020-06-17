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


const ByteBuffer = require('../util/ByteBuffer');


class TokenInfoDictionary {
  /**
   * TokenInfoDictionary
   * @constructor
   */
  constructor() {
    this.dictionary = new ByteBuffer(10 * 1024 * 1024);
    // trie_id (of surface form) -> token_info_id (of token)
    this.target_map = {};
    this.pos_buffer = new ByteBuffer(10 * 1024 * 1024);
  }

  // left_id right_id word_cost ...
  // ^ this position is token_info_id
  buildDictionary(entries) {
    // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
    const dictionary_entries = {};

    entries.forEach((entry) => {
      if (entry.length < 4) {
        return;
      }

      const [
        surface_form,
        left_id,
        right_id,
        word_cost,
      ] = entry;
      // TODO Optimize
      const feature = entry.slice(4).join(',');

      // Assertion
      if (!Number.isFinite(+left_id) || !Number.isFinite(+right_id) || !Number.isFinite(+word_cost)) {
        console.log(entry);
      }

      const token_info_id = this.put(left_id, right_id, word_cost, surface_form, feature);
      dictionary_entries[token_info_id] = surface_form;
    });

    // Remove last unused area
    this.dictionary.shrink();
    this.pos_buffer.shrink();

    return dictionary_entries;
  }

  put(left_id, right_id, word_cost, surface_form, feature) {
    const token_info_id = this.dictionary.position;
    const pos_id = this.pos_buffer.position;

    // TODO here might be a bug:
    // left_id, right_id, word_cost are integer numbers
    // but putShort() treats them as HEX
    // in additional, the lower/upper extracting is also wrong
    this.dictionary.putShort(left_id);
    this.dictionary.putShort(right_id);
    this.dictionary.putShort(word_cost);
    this.dictionary.putInt(pos_id);
    this.pos_buffer.putString(`${surface_form},${feature}`);

    return token_info_id;
  }

  addMapping(source, target) {
    const mapping = this.target_map[source] || [];
    mapping.push(target);

    this.target_map[source] = mapping;
  }

  targetMapToBuffer() {
    const buffer = new ByteBuffer();
    const map_keys_size = Object.keys(this.target_map).length;
    buffer.putInt(map_keys_size);

    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const key in this.target_map) {
      // Array
      const values = this.target_map[key];
      const map_values_size = values.length;
      buffer.putInt(parseInt(key, 10));
      buffer.putInt(map_values_size);
      for (let i = 0; i < values.length; i += 1) {
        buffer.putInt(values[i]);
      }
    }

    // Shrink-ed Typed Array
    return buffer.shrink();
  }

  // from tid.dat
  loadDictionary(array_buffer) {
    this.dictionary = new ByteBuffer(array_buffer);
    return this;
  }

  // from tid_pos.dat
  loadPosVector(array_buffer) {
    this.pos_buffer = new ByteBuffer(array_buffer);
    return this;
  }

  // from tid_map.dat
  loadTargetMap(array_buffer) {
    const buffer = new ByteBuffer(array_buffer);
    buffer.position = 0;
    this.target_map = {};
    // map_keys_size
    buffer.readInt();
    while (true) {
      if (buffer.buffer.length < buffer.position + 1) {
        break;
      }
      const key = buffer.readInt();
      const map_values_size = buffer.readInt();
      for (let i = 0; i < map_values_size; i += 1) {
        const value = buffer.readInt();
        this.addMapping(key, value);
      }
    }
    return this;
  }

  /**
   * Look up features in the dictionary
   * @param {string} token_info_id_str Word ID to look up
   * @returns {string} Features string concatenated by ","
   */
  getFeatures(token_info_id_str) {
    const token_info_id = parseInt(token_info_id_str, 10);
    if (Number.isNaN(token_info_id)) {
      // TODO throw error
      return '';
    }
    const pos_id = this.dictionary.getInt(token_info_id + 6);
    return this.pos_buffer.getString(pos_id);
  }
}


module.exports = TokenInfoDictionary;
