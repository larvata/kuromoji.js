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


/**
 * Mappings between IPADIC dictionary features and tokenized results
 * @constructor
 */
class IpadicFormatter {
  // eslint-disable-next-line class-methods-use-this
  formatEntry(word_id, position, type, features) {
    const token = {};
    token.word_id = word_id;
    token.word_type = type;
    token.word_position = position;

    [
      token.surface_form,
      token.pos,
      token.pos_detail_1,
      token.pos_detail_2,
      token.pos_detail_3,
      token.conjugated_type,
      token.conjugated_form,
      token.basic_form,
      token.reading,
      token.pronunciation,
    ] = features;

    return token;
  }

  // eslint-disable-next-line class-methods-use-this
  formatUnknownEntry(word_id, position, type, features, surface_form) {
    const token = {};
    token.word_id = word_id;
    token.word_type = type;
    token.word_position = position;

    token.surface_form = surface_form;

    [, // skip the surface_form for the first item
      token.pos,
      token.pos_detail_1,
      token.pos_detail_2,
      token.pos_detail_3,
      token.conjugated_type,
      token.conjugated_form,
      token.basic_form,
      // token.reading,
      // token.pronunciation,
    ] = features;

    return token;
  }
}


module.exports = IpadicFormatter;
