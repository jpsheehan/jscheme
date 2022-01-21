import { describe, it } from "mocha"
import { assert } from "chai"

import { foo, getDefaultEnvironment } from "../src/index"

describe('library', () => {
    describe('inc', () => {
        const env = getDefaultEnvironment();

        it('should increment a number', () => {
            assert.equal(2, foo.call(env, ["inc", 1]));
        });
        // todo: test errors are thrown with non-numbers
    });

    describe('dec', () => {
        const env = getDefaultEnvironment();

        it('should decrement a number', () => {
            assert.equal(0, foo.call(env, ["dec", 1]));
        })
    });

    describe('zero?', () => {
        const env = getDefaultEnvironment();

        it('should return true when argument is 0', () => {
            assert.equal(true, foo.call(env, ["zero?", 0]));
        });
        it('should return false when the argument is not 0', () => {
            assert.equal(false, foo.call(env, ["zero?", 1]));
        });
        it('should return false when the argument is not a number', () => {
            assert.equal(false, foo.call(env, ["zero?", []]));
            assert.equal(false, foo.call(env, ["zero?", "zero?"]));
            assert.equal(false, foo.call(env, ["zero?", true]));
        });
    });

    describe('nil?', () => {
        const env = getDefaultEnvironment();

        it('should return true when the argument is null', () => {
            assert.equal(foo.call(env, ["nil?", null]), true);
        })
        it('should return true when the argument calls ["list"]', () => {
            assert.equal(foo.call(env, ["nil?", ["list"]]), true);
        })
        it('should return true when the argument is []', () => {
            assert.equal(foo.call(env, ["nil?", []]), true);
        })
        it('should return false if a non-empty list is supplied', () => {
            assert.equal(foo.call(env, ["nil?", ["cons", 1, null]]), false);
            assert.equal(foo.call(env, ["nil?", ["list", 1, 2, 3, 4]]), false);
        })
    });

    describe('car', () => {
        const env = getDefaultEnvironment();

        it('should return the first element of a cons pair', () => {
            assert.equal(foo.call(env, ["car", ["cons", 13, 1010]]), 13);
            assert.equal(foo.call(env, ["car", ["cons", 1, ["cons", 2, ["cons", 3, null]]]]), 1);
            assert.equal(foo.call(env, ["car", ["cdr", ["cons", 1, ["cons", 2, ["cons", 3, null]]]]]), 2);
        });
    });

    describe('cdr', () => {
        const env = getDefaultEnvironment();
        it('should return the second element of a cons pair', () => {
        assert.equal(foo.call(env, ["cdr", ["cons", 13, 1010]]), 1010);
        })
    });

    describe('map', () => {
        const env = getDefaultEnvironment();

        it('should return null when mapping over an empty collection', () => {
            assert.equal(foo.call(env, ["map", "inc", []]), null);
        });

        it('should return mapped items', () => {
            assert.equal(foo.call(env, ["car", ["map", "inc", ["list", 1, 2, 3]]]), 2);
            assert.equal(foo.call(env, ["car", ["cdr", ["map", "inc", ["list", 1, 2, 3]]]]), 3);
            assert.equal(foo.call(env, ["car", ["cdr", ["cdr", ["map", "inc", ["list", 1, 2, 3]]]]]), 4);
            assert.equal(foo.call(env, ["cdr", ["cdr", ["cdr", ["map", "inc", ["list", 1, 2, 3]]]]]), null);
        })
        
    });

    describe('filter', () => {
        const env = getDefaultEnvironment();
        foo.call(env, ["define", "numbers", ["list", 1, 2, 3, 4]]);
        foo.call(env, ["define", "evens", ["filter", "even?", "numbers"]]);

        it('should return null when filtering an empty collection', () => {
            assert.equal(foo.call(env, ["filter", "evens", []]), null);
        });
        it('should filter based upon a predicate', () => {
            assert.equal(foo.call(env, ["car", "evens"]), 2);
            assert.equal(foo.call(env, ["cadr", "evens"]), 4);
            assert.equal(foo.call(env, ["length", "evens"]), 2)
        })
    });

    describe('reduce', () => {
        const env = getDefaultEnvironment();
        foo.call(env, ["define", "numbers", ["list", 1, 2, 3, 4]]);
        foo.call(env, ["define", ["sum", "coll"], ["reduce", "+", 0, "coll"]]);
        foo.call(env, ["define", ["product", "coll"], ["reduce", "*", 1, "coll"]]);

        it('should reduce to the initial value if an empty list is supplied', () => {
            assert.equal(foo.call(env, ["reduce", "+", 123, []]), 123);
        })
        it('should reduce a list appropriately', () => {
            assert.equal(foo.call(env, ["sum", "numbers"]), 10);
            assert.equal(foo.call(env, ["product", "numbers"]), 24);
        })
    });

    describe('length', () => {
        const env = getDefaultEnvironment();

        it('should return 0 for an empty list', () => {
            assert.equal(foo.call(env, ["length", ["list"]]), 0);
            assert.equal(foo.call(env, ["length", null]), 0);
        })
        it("should return the correct lengths for non-empty lists", () => {
            assert.equal(foo.call(env, ["length", ["list", 1234]]), 1);
            assert.equal(foo.call(env, ["length", ["list", 1234, 4567]]), 2);
            assert.equal(foo.call(env, ["length", ["cons", true, null]]), 1);
        })
    });

    describe('nth', () => {
        const env = getDefaultEnvironment();

        it('should return the nth element', () => {
            assert.equal(foo.call(env, ["nth", 7, ["list", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]), 7);
        })
    });

    (function testReverse() {
        const env = getDefaultEnvironment();
        assert.equal(foo.call(env, ["reverse", ["list"]]), null);
        assert.equal(foo.call(env, ["reverse", null]), null);
        assert.equal(foo.call(env, ["first", ["reverse", ["list", 42]]]), 42);
        assert.equal(foo.call(env, ["first", ["reverse", ["list", 39, 42]]]), 42);
        assert.equal(foo.call(env, ["car", ["reverse", ["cons", 1, ["cons", 2, ["cons", 3, null]]]]]), 3);
    })();

    describe('first', () => {
        const env = getDefaultEnvironment();

        it('should return null if an empty list is passed', () => {
            assert.equal(foo.call(env, ["first", null]), null);
        });
        it('should return the first element in a non-empty list', () => {
            assert.equal(foo.call(env, ["first", ["cons", 1, 2]]), 1);
            assert.equal(foo.call(env, ["first", ["list", 6, 5, 4, 3, 2, 1]]), 6);
        })
    });

    describe('init', () => {
        const env = getDefaultEnvironment();

        it('should return null for an empty list', () => {
            assert.equal(foo.call(env, ["init", null]), null);
        });
        it('should return null for a list with one item', () => {
            assert.equal(foo.call(env, ["init", ["list", 1]]), null);
        })
        it('should return a list containing all but the last item in a non-empty list', () => {
            assert.equal(foo.call(env, ["car", ["init", ["list", 1, 2]]]), 1);
        })
    });
});