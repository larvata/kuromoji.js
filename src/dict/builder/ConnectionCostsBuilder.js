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


const ConnectionCosts = require('../ConnectionCosts');


class ConnectionCostsBuilder {
  /**
   * Builder class for constructing ConnectionCosts object
   * @constructor
   */
  constructor() {
    this.lines = 0;
    this.connection_cost = null;
  }

  put(costs) {
    if (this.lines === 0) {
      // first data is the two-dimensional matrix def
      const [forward_dimension, backward_dimension] = costs;

      if (forward_dimension < 0 || backward_dimension < 0) {
        throw new Error('Parse error of matrix.bin/matrix.def');
      }

      this.connection_cost = new ConnectionCosts(forward_dimension, backward_dimension);
      this.lines += 1;
      return this;
    }

    if (costs.length !== 3) {
      return this;
    }

    const [forward_id, backward_id, cost] = costs;
    if (forward_id < 0 || backward_id < 0
      || this.connection_cost.forward_dimension <= forward_id
      || this.connection_cost.backward_dimension <= backward_id) {
      throw new Error('Parse error of matrix.def');
    }

    this.connection_cost.put(forward_id, backward_id, cost);
    this.lines += 1;
    return this;
  }

  putLine(line) {
    const costs = line.split(' ')
      .map((c) => parseInt(c, 10));
    this.put(costs);
  }

  build() {
    return this.connection_cost;
  }
}


module.exports = ConnectionCostsBuilder;
