import { describe, it } from "mocha"
import { assert } from "chai"

import { foo, getDefaultEnvironment } from "../src/index"

describe('special forms', () => {
    describe('lambda', () => {
        const env = getDefaultEnvironment();

        it('should return a procedure with no arguments', () => {
            assert.equal(foo.call(env, [['lambda', [], 123]]), 123);
        })
        it('should return a procedure with one argument', () => {
            assert.equal(foo.call(env, [['lambda', ['x'], 'x'], 5]), 5);
        });
        it('should return a procedure with two arguments', () => {
            assert.equal(foo.call(env, [['lambda', ['x', 'y'], ['*', 'x', 'y']], 3, 4]), 12);
            assert.equal(foo.call(env, [['lambda', ['x', 'y'], ['*', 'x', 'y']], ['+', 2, 1], ['*', ['+', 1, 1], ['*', -2, -2]]]), 24);    
        })
        
        it('should return a procedure that accepts any number of arguments', () => {
            // assert.equal(foo.call(env, [['lambda', ['.', 'xs'], ["length", "xs"]], 1, 2, 3, 4, 5]), 5)
        })
        it('should return a procedure that accepts at least one argument', () => {
            assert.deepEqual(foo.call(env, [['lambda', ['x', '.', 'ys'], 'ys'], 1, 2, 3]), [2, 3]);
        })
        it('should return a procedure that accepts at least two arguments', () => {
            assert.equal(foo.call(env, [['lambda', ['x', 'y', '.', 'zs'], ['-', ['apply', '+', 'zs'], ['*', 'x', 'y']]], 1, 2, 3, 4, 5]), 10);
        })
    });

    (function testDefine() {
        const env = getDefaultEnvironment();

        assert.equal(env['age'], undefined);
        foo.call(env, ['define', 'age', 29]);
        assert.equal(env['age'], 29);
        assert.equal(foo.call(env, 'age'), 29);

        assert.equal(env['identity2'], undefined);
        foo.call(env, ['define', 'identity2', ['lambda', ['x'], 'x']]);
        assert.notEqual(env['identity2'], undefined);
        assert.equal(foo.call(env, ['identity2', 42]), 42);
        assert.equal(foo.call(env, ['identity2', 'age']), 29);

        foo.call(env, ['define', 'myplus', '+']);
        assert.equal(foo.call(env, ['myplus', 2, 3]), 5);

        foo.call(env, ['define', 'add', ['lambda', ['x', 'y'], ['myplus', 'x', 'y']]]);
        assert.equal(foo.call(env, ['add', 9, 6]), 15);
    })();

    (function testDefineLambda() {
        const env = getDefaultEnvironment();

        assert.equal(env['identity2'], undefined);
        foo.call(env, ['define', ['identity2', 'x'], 'x']);
        assert.notEqual(env['identity2'], undefined);
        assert.equal(foo.call(env, ['identity2', 420]), 420);
    })();

    (function testIf() {
        const env = getDefaultEnvironment();
        assert.equal(foo.call(env, ["if", true, 222, 111]), 222);
        assert.equal(foo.call(env, ["if", false, 222, 111]), 111);
    })();
});