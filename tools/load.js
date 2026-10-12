// Node 用：ブラウザと同じファイルを vm で読み込む
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
module.exports = function load(files) {
  const C = { console, Math, Date }; vm.createContext(C);
  (files || ['topics1.js', 'topics2.js', 'topics3.js', 'topics4.js', 'facts.js', 'kb.js', 'brain.js', 'weights.js', 'chars.js', 'logic.js']).forEach(f => {
    const p = path.join(ROOT, f); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), C, { filename: f });
  });
  return C;
};
