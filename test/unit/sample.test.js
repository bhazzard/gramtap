const { test } = require('uvu');
const assert = require('uvu/assert');

test('sample test - basic math', () => {
  assert.equal(2 + 2, 4);
  assert.not.equal(2 + 2, 5);
});

test('sample test - string concatenation', () => {
  const result = 'hello' + ' ' + 'world';
  assert.equal(result, 'hello world');
});

test('sample test - array operations', () => {
  const arr = [1, 2, 3];
  arr.push(4);
  assert.equal(arr.length, 4);
  assert.equal(arr[3], 4);
});

test.run();