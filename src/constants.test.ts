import { describe, it } from "mocha"
import { assert } from "chai"

import { foo } from "../src/index"

describe('constants', ()=>{
    it('should allow constants to pass through', () => {
        assert.equal(foo.call({}, 41), 41);
        assert.equal(foo.call({}, true), true);
        assert.equal(foo.call({}, false), false);
        assert.equal(foo.call({}, 0), 0);
    });
    it('should parse a nil list properly', () => {
        assert.equal(foo.call({}, []), null);
        assert.equal(foo.call({}, null), null);
    })
});