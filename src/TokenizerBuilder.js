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


const Tokenizer = require('./Tokenizer');
const DictionaryLoader = require('./loader/NodeDictionaryLoader');


class TokenizerBuilder {
  /**
   * TokenizerBuilder create Tokenizer instance.
   * @param {Object} option JSON object which have key-value pairs settings
   * @param {string} option.dicPath Dictionary directory path (or URL using in browser)
   * @constructor
   */
  constructor(option = {}) {
    this.dic_path = option.dicPath || 'dict/';
  }

  /**
   * Build Tokenizer instance by asynchronous manner
   */
  build() {
    const loader = new DictionaryLoader(this.dic_path);
    return loader.load().then((dic) => new Tokenizer(dic));
  }
}

module.exports = TokenizerBuilder;
