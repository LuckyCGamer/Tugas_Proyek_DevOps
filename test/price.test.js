const test = require('node:test');
const assert = require('node:assert/strict');
const { calcTotal, validWeight } = require('../server/utils/price');

test('calcTotal multiplies weight by price per kilogram', () => {
  assert.equal(calcTotal(3, 5000), 15000);
});

test('calcTotal rounds the result to two decimal places', () => {
  assert.equal(calcTotal(2.5, 1.25), 3.13);
});

test('validWeight accepts values within the supported range', () => {
  assert.equal(validWeight(0.01), true);
  assert.equal(validWeight(999.99), true);
  assert.equal(validWeight('2.5'), true);
});

test('validWeight rejects zero, negative, and over-limit values', () => {
  for (const weight of [0, -1, 1000]) {
    assert.equal(validWeight(weight), false);
  }
});

test('validWeight rejects non-numeric and non-finite values', () => {
  for (const weight of ['', 'not a number', NaN, Infinity, null, undefined, true, []]) {
    assert.equal(validWeight(weight), false);
  }
});
