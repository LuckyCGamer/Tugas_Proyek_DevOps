const test = require('node:test');
const assert = require('node:assert/strict');

test('Menghitung total harga laundry', () => {
    const berat = 3;
    const hargaPerKg = 5000;

    const total = berat * hargaPerKg;

    assert.equal(total, 15000);
});

test('Berat laundry tidak boleh negatif', () => {
    const berat = -2;

    assert.ok(berat < 0);
});