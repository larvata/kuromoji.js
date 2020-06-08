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

/* eslint-disable no-bitwise */

/**
 * Convert String (UTF-16) to UTF-8 ArrayBuffer
 *
 * @param {String} str UTF-16 string to convert
 * @return {Uint8Array} Byte sequence encoded by UTF-8
 */
const stringToUtf8Bytes = (str) => {
  const uint8array = new TextEncoder('utf-8').encode(str);
  return uint8array;
};

/**
 * Convert UTF-8 ArrayBuffer to String (UTF-16)
 *
 * @param {Array} bytes UTF-8 byte sequence to convert
 * @return {String} String encoded by UTF-16
 */
const utf8BytesToString = (bytes) => {
  const uint8array = new Uint8Array(bytes);
  const string = new TextDecoder().decode(uint8array);
  return string;
};


class ByteBuffer {
  /**
   * Utilities to manipulate byte sequence
   * @param {(number|Uint8Array)} arg Initial size of this buffer (number), or buffer to set (Uint8Array)
   * @constructor
   */
  constructor(arg) {
    let initial_size;
    if (arg == null) {
      initial_size = 1024 * 1024;
    } else if (typeof arg === 'number') {
      initial_size = arg;
    } else if (arg instanceof Uint8Array) {
      this.buffer = arg;
      // Overwrite
      this.position = 0;
      return;
    } else {
      // typeof arg -> String
      throw new Error(`${typeof arg} is invalid parameter type for ByteBuffer constructor`);
    }
    // arg is null or number
    this.buffer = new Uint8Array(initial_size);
    this.position = 0;
  }

  size() {
    return this.buffer.length;
  }

  reallocate() {
    const new_array = new Uint8Array(this.buffer.length * 2);
    new_array.set(this.buffer);
    this.buffer = new_array;
  }


  shrink() {
    this.buffer = this.buffer.subarray(0, this.position);
    return this.buffer;
  }


  put(b) {
    if (this.buffer.length < this.position + 1) {
      this.reallocate();
    }
    this.buffer[this.position] = b;
    this.position += 1;
  }


  get(index) {
    if (index == null) {
      index = this.position;
      this.position += 1;
    }
    if (this.buffer.length < index + 1) {
      return 0;
    }
    return this.buffer[index];
  }

  // Write short to buffer by little endian
  putShort(num) {
    if (num > 0xFFFF) {
      throw new Error(`${num} is over short value`);
    }
    const lower = (0x00FF & num);
    const upper = (0xFF00 & num) >> 8;
    this.put(lower);
    this.put(upper);
  }

  // Read short from buffer by little endian

  getShort(index) {
    if (index == null) {
      index = this.position;
      this.position += 2;
    }
    if (this.buffer.length < index + 2) {
      return 0;
    }
    const lower = this.buffer[index];
    const upper = this.buffer[index + 1];
    let value = (upper << 8) + lower;
    if (value & 0x8000) {
      value = -((value - 1) ^ 0xFFFF);
    }
    return value;
  }

  // Write integer to buffer by little endian
  putInt(num) {
    if (num > 0xFFFFFFFF) {
      throw new Error(`${num} is over integer value`);
    }
    const b0 = (0x000000FF & num);
    const b1 = (0x0000FF00 & num) >> 8;
    const b2 = (0x00FF0000 & num) >> 16;
    const b3 = (0xFF000000 & num) >> 24;
    this.put(b0);
    this.put(b1);
    this.put(b2);
    this.put(b3);
  }

  // Read integer from buffer by little endian

  getInt(index) {
    if (index == null) {
      index = this.position;
      this.position += 4;
    }
    if (this.buffer.length < index + 4) {
      return 0;
    }
    const b0 = this.buffer[index];
    const b1 = this.buffer[index + 1];
    const b2 = this.buffer[index + 2];
    const b3 = this.buffer[index + 3];

    return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
  }


  readInt() {
    const pos = this.position;
    this.position += 4;
    return this.getInt(pos);
  }


  putString(str) {
    const bytes = stringToUtf8Bytes(str);
    bytes.forEach((byte) => this.put(byte));

    // put null character as terminal character
    this.put(0);
  }


  getString(index) {
    const buf = [];
    let ch;
    if (index == null) {
      index = this.position;
    }
    while (true) {
      if (this.buffer.length < index + 1) {
        break;
      }
      ch = this.get(index++);
      if (ch === 0) {
        break;
      } else {
        buf.push(ch);
      }
    }
    this.position = index;
    return utf8BytesToString(buf);
  }
}


module.exports = ByteBuffer;
