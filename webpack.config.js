const path = require('path');

module.exports = {
  entry: './src/kuromoji.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'kuromoji.js',
    library: 'kuromoji',
    libraryTarget: 'window',
  },
  mode: 'production',
};
