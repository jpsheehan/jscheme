import { describe, it } from "mocha"
import { assert } from "chai"

import { foo, getDefaultEnvironment } from "../src/index"

	(function testDefaultForms() {
		(function testMultiply() {
			const env = getDefaultEnvironment();
			assert.equal(60, foo.call(env, ['*', 3, 4, 5]));
			assert.equal(1, foo.call(env, ['*']));
			assert.equal(101, foo.call(env, ['*', 101]));
		})();

		(function testPlus() {
			const env = getDefaultEnvironment();
			assert.equal(12, foo.call(env, ['+', 3, 4, 5]));
			assert.equal(0, foo.call(env, ['+']));
			assert.equal(101, foo.call(env, ['+', 101]));
		})();

		(function testQuote() {
			const env = getDefaultEnvironment();
			assert.equal(foo.call(env, ['quote', '+']), '+');
			assert.deepEqual(foo.call(env, ['quote', [1, 2, 3]]), [1, 2, 3]);
		})();

		(function testApply() {
			const env = getDefaultEnvironment();
			assert.equal(foo.call(env, ['apply', '+', ['quote', [1, 2, 3, 4, 5]]]), 15);
		})();

		(function testList() {
			const env = getDefaultEnvironment();
			assert.equal(foo.call(env, ["car", ["list", 1, 2, 3, 4]]), 1)
		})();
	})();

	