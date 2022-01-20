const specialForms = {
	"lambda": function (formals, ...body) {
		const env = this;

		const indexOfVariadicMarker = formals.indexOf(".");
		const isVariadic = indexOfVariadicMarker !== -1;
		if (isVariadic) {
			if (formals.lastIndexOf(".") !== indexOfVariadicMarker) {
				throw new Error("lambda expected one variadic marker");
			}

			if (indexOfVariadicMarker !== formals.length - 2) {
				throw new Error("lambda expected variadic marker in second to last place");
			}
		}

		const requiresNArguments = isVariadic ? formals.length - 2 : formals.length;

		if (formals.some(f => typeof f !== "string")) {
			throw new Error("formal parameters must be strings");
		}
		if (formals.some((formal, i) => formals.slice(i + 1).some(x => x === formal))) {
			throw new Error("formal parameters must be unique");
		}

		return function (...args) {
			checkArity(args);
			const appliedArgs = {};
			if (isVariadic) {
				const requiredFormals = formals.slice(0, requiresNArguments);
				const variadicFormal = formals[formals.length - 1];
				requiredFormals.forEach((formal, i) => appliedArgs[formal] = foo.call(env, args[i]));
				appliedArgs[variadicFormal] = args.slice(requiresNArguments);

			} else {
				formals.forEach((formal, i) => appliedArgs[formal] = foo.call(env, args[i]));
			}
			return foo.apply({ ...env, ...appliedArgs }, body);

			function checkArity() {
				if (isVariadic) {
					if (args.length < requiresNArguments) {
						throw new Error(`lambda expected ${requiresNArguments}+ arguments, got ${args.length}`)
					}
				} else if (args.length !== requiresNArguments) {
					throw new Error(`lambda expected ${requiresNArguments} arguments, got ${args.length}`);
				}
			}
		}
	},
	"define": function (name, ...value) {
		const env = this;
		if (typeof name === "string") {
			// a constant definition
			if (value.length !== 1) {
				throw new Error('define expects one value')
			}
			env[name] = foo.call(env, value[0]);
		} else {
			// a lambda definition
			if (!Array.isArray(name) || typeof name[0] !== "string") {
				throw new Error("invalid syntax for 'define'")
			}
			const formals = name.slice(1);
			env[name[0]] = specialForms.lambda.call(env, formals, ...value);
		}
		return null;
	},
	"if": function (predicate, consequent, alternative) {
		const env = this;
		if (isTruthy(foo.call(env, predicate))) {
			return foo.call(env, consequent);
		} else {
			return foo.call(env, alternative);
		}

		function isTruthy(x) {
			return !!x;
		}
	}
}

const defaultForms = {
	"*": function (...xs) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			return foo.call(env, x) * foo.call(env, y);
		}, foo.call(env, xs[0])) ?? 1;
	},
	"/": function (...xs) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			return foo.call(env, x) / foo.call(env, y);
		}, foo.call(env, xs[0])) ?? 1;
	},
	"+": function (...xs) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			return foo.call(env, x) + foo.call(env, y);
		}, foo.call(env, xs[0])) ?? 0;
	},
	"-": function (...xs) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			return foo.call(env, x) - foo.call(env, y);
		}, foo.call(env, xs[0])) ?? 0;
	},
	"=": function (...xs) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			return foo.call(env, x) === foo.call(env, y);
		}, foo.call(env, xs[0])) ?? true;
	},
	"%": function (...xs) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			return foo.call(env, x) % foo.call(env, y);
		}, foo.call(env, xs[0]));
	},
	"apply": function (fn, args) {
		const env = this;
		return foo.call(env, [foo.call(env, fn), ...foo.call(env, args)]);
	},
	"quote": function (x) {
		return x;
	},
	"list": function (...xs) {
		const env = this;
		return xs
			.reduceRight((x, y) => foo
				.call(env, ["cons", y, foo.call(env, x)]),
				foo.call(env, null));
	},
	"not": function (x) {
		const env = this;
		return foo.call(env, x) ? false : true;
	}
}

const library = {
	"inc": ["lambda", ["x"], ["+", "x", 1]],
	"dec": ["lambda", ["x"], ["-", "x", 1]],
	"zero?": ["lambda", ["x"], ["=", "x", 0]],
	"even?": ["lambda", ["x"], ["zero?", ["%", "x", 2]]],
	"odd?": ["lambda", ["x"], ["not", ["even?", "x"]]],

	"cons": ["lambda", ["a", "b"], ["lambda", ["x"], ["if", ["=", "x", 0], "a", "b"]]],
	"car": ["lambda", ["x"], ["x", 0]],
	"cdr": ["lambda", ["x"], ["x", 1]],
	"caar": ["lambda", ["x"], ["car", ["car", "x"]]],
	"cadr": ["lambda", ["x"], ["car", ["cdr", "x"]]],
	"cdar": ["lambda", ["x"], ["cdr", ["car", "x"]]],
	"cddr": ["lambda", ["x"], ["cdr", ["cdr", "x"]]],

	"map": ["lambda", ["fn", "coll"],
		["if", ["nil?", "coll"],
			null,
			["cons", ["fn", ["car", "coll"]], ["map", "fn", ["cdr", "coll"]]]]],
	"filter": ["lambda", ["fn", "coll"],
		["if", ["nil?", "coll"],
			null,
			["if", ["fn", ["car", "coll"]],
				["cons", ["car", "coll"], ["filter", "fn", ["cdr", "coll"]]],
				["filter", "fn", ["cdr", "coll"]]]]],
	"reduce": ["lambda", ["fn", "initial", "coll"],
		["if", ["nil?", "coll"],
			"initial",
			["reduce", "fn", ["fn", "initial", ["car", "coll"]], ["cdr", "coll"]]
		]],

	"length":
		["lambda", ["coll"],
			["if", ["nil?", "coll"],
				0,
				["inc", ["length", ["cdr", "coll"]]]]],
	"nil?": ["lambda", ["coll"],
		["=", "coll", null]],
	"reverse":
		/**
		 * (reverse '()) ==> '()
		 * (reverse '(1 . ())) ==> '(1 . ())
		 * (reverse '(1 . (2 . ()))) ==> '(2 . (1 . ()))
		 */
		["lambda", ["coll"],
			["if", ["nil?", "coll"],
				null,
				["cons", ["reverse", ["cdr", "coll"]], ["car", "coll"]]]],
	"nth":
		["lambda", ["n", "coll"],
			["if", ["zero?", "n"],
				["car", "coll"],
				["nth", ["dec", "n"], ["cdr", "coll"]]]],
	"first":
		["lambda", ["coll"],
			["if", ["nil?", "coll"],
				null,
				["car", "coll"]]],
	"last":
		["lambda", ["coll"],
			["if", ["nil?", "coll"],
				null,
				["if", ["nil?", ["cdr", "coll"]],
					["car", "coll"],
					["last", ["cdr", "coll"]]]]]
}

function getDefaultEnvironment() {
	const env = {
		...specialForms,
		...defaultForms,
		...library
	};
	return env;
}

function foo(expr) {
	if (typeof expr === "string") {
		return this[expr];
	}
	if (Array.isArray(expr)) {
		if (expr.length === 0)
			return null;
		const fn = foo.call(this, foo.call(this, expr[0]));
		if (typeof fn === "function") {
			const args = expr.slice(1);
			return fn.apply(this, args);
		}
		console.error(fn)
		throw new Error("Cannot call non-function")
	}
	return expr;
}

// tests
function test() {
	const assert = require("assert");

	(function testConstants() {
		assert.equal(foo(41), 41);
		assert.equal(foo(true), true);
		assert.equal(foo(false), false);
		assert.equal(foo(0), 0);
		assert.equal(foo([]), null);
	})();

	(function testSpecialForms() {
		(function testLambda() {
			const env = getDefaultEnvironment();
			assert.equal(foo.call(env, [['lambda', ['x'], 'x'], 5]), 5);
			assert.equal(foo.call(env, [['lambda', ['x', 'y'], ['*', 'x', 'y']], 3, 4]), 12);
			assert.equal(foo.call(env, [['lambda', ['x', 'y'], ['*', 'x', 'y']], ['+', 2, 1], ['*', ['+', 1, 1], ['*', -2, -2]]]), 24);

			assert.deepEqual(foo.call(env, [['lambda', ['x', '.', 'ys'], 'ys'], 1, 2, 3]), [2, 3]);
			assert.equal(foo.call(env, [['lambda', ['x', 'y', '.', 'zs'], ['-', ['apply', '+', 'zs'], ['*', 'x', 'y']]], 1, 2, 3, 4, 5]), 10);
		})();

		(function testDefine() {
			const env = getDefaultEnvironment();

			assert.equal(env['age'], undefined);
			foo.call(env, ['define', 'age', 29]);
			assert.equal(env['age'], 29);
			assert.equal(foo.call(env, 'age'), 29);

			assert.equal(env['identity'], undefined);
			foo.call(env, ['define', 'identity', ['lambda', ['x'], 'x']]);
			assert.notEqual(env['identity'], undefined);
			assert.equal(foo.call(env, ['identity', 42]), 42);
			assert.equal(foo.call(env, ['identity', 'age']), 29);

			foo.call(env, ['define', 'myplus', '+']);
			assert.equal(foo.call(env, ['myplus', 2, 3]), 5);

			foo.call(env, ['define', 'add', ['lambda', ['x', 'y'], ['myplus', 'x', 'y']]]);
			assert.equal(foo.call(env, ['add', 9, 6]), 15);
		})();

		(function testDefineLambda() {
			const env = getDefaultEnvironment();

			assert.equal(env['identity'], undefined);
			foo.call(env, ['define', ['identity', 'x'], 'x']);
			assert.notEqual(env['identity'], undefined);
			assert.equal(foo.call(env, ['identity', 420]), 420);
		})();

		(function testIf() {
			const env = getDefaultEnvironment();
			assert.equal(foo.call(env, ["if", true, 222, 111]), 222);
			assert.equal(foo.call(env, ["if", false, 222, 111]), 111);
		})();
	})();

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

	(function testLibrary() {
		(function testInc() {
			const env = getDefaultEnvironment();
			assert.equal(2, foo.call(env, ["inc", 1]));
		})();
		(function testDec() {
			const env = getDefaultEnvironment();
			assert.equal(0, foo.call(env, ["dec", 1]));
		})();
		(function testZeroQ() {
			const env = getDefaultEnvironment();
			assert.equal(true, foo.call(env, ["zero?", 0]));
			assert.equal(false, foo.call(env, ["zero?", 1]));
			assert.equal(false, foo.call(env, ["zero?", []]));
		})();

		// (function testNilQ() {
		// 	const env = getDefaultEnvironment();
		// 	assert.deepEqual(foo.call(env, ["nil?", []]), true);
		// 	assert.deepEqual(foo.call(env, ["nil?", [1]]), false);
		// })();

		(function testConsCarCdr() {
			const env = getDefaultEnvironment();
			assert.equal(foo.call(env, ["car", ["cons", 13, 1010]]), 13);
			assert.equal(foo.call(env, ["cdr", ["cons", 13, 1010]]), 1010);
		})();

		(function testCar() {
			const env = getDefaultEnvironment();
			// foo.call(env, ["define", "nums", ["cons", 1, ["cons", 2, ["cons", 3, []]]]]);
			assert.equal(foo.call(env, ["car", ["cons", 1, ["cons", 2, ["cons", 3, null]]]]), 1);
			assert.equal(foo.call(env, ["car", ["cdr", ["cons", 1, ["cons", 2, ["cons", 3, null]]]]]), 2);
		})();

		(function testMap() {
			const env = getDefaultEnvironment();
			assert.equal(foo.call(env, ["car", ["map", "inc", ["list", 1, 2, 3]]]), 2);
			assert.equal(foo.call(env, ["car", ["cdr", ["map", "inc", ["list", 1, 2, 3]]]]), 3);
			assert.equal(foo.call(env, ["car", ["cdr", ["cdr", ["map", "inc", ["list", 1, 2, 3]]]]]), 4);
			assert.equal(foo.call(env, ["cdr", ["cdr", ["cdr", ["map", "inc", ["list", 1, 2, 3]]]]]), null);
		})();

		(function testFilter() {
			const env = getDefaultEnvironment();
			foo.call(env, ["define", "numbers", ["list", 1, 2, 3, 4]]);
			foo.call(env, ["define", "evens", ["filter", "even?", "numbers"]]);
			assert.equal(foo.call(env, ["car", "evens"]), 2);
			assert.equal(foo.call(env, ["cadr", "evens"]), 4);
			assert.equal(foo.call(env, ["length", "evens"]), 2)
		})();

		(function testReduce() {
			const env = getDefaultEnvironment();
			foo.call(env, ["define", "numbers", ["list", 1, 2, 3, 4]]);
			foo.call(env, ["define", ["sum", "coll"], ["reduce", "+", 0, "coll"]]);
			foo.call(env, ["define", ["product", "coll"], ["reduce", "*", 1, "coll"]]);
			assert.equal(foo.call(env, ["sum", "numbers"]), 10);
			assert.equal(foo.call(env, ["product", "numbers"]), 24);
		})();

		(function testLength() {
			const env = getDefaultEnvironment();
			assert.equal(foo.call(env, ["length", ["list"]]), 0);
			assert.equal(foo.call(env, ["length", null]), 0);
			assert.equal(foo.call(env, ["length", ["list", 1234]]), 1);
			assert.equal(foo.call(env, ["length", ["list", 1234, 4567]]), 2);
			assert.equal(foo.call(env, ["length", ["cons", true, null]]), 1);
		})();

		(function testNth() {
			const env = getDefaultEnvironment();
			assert.equal(foo.call(env, ["nth", 7, ["list", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]), 7);
		})();

		(function testReverse() {
			const env = getDefaultEnvironment();
			// foo.call(env, ["define", "nums", ["cons", 1, ["cons", 2, ["cons", 3, []]]]]);
			// foo.call(env, ["define", "rnums", ["reverse", ["cons", 1, ["cons", 2, ["cons", 3, []]]]]]);
			assert.equal(foo.call(env, ["car", ["reverse", ["cons", 1, ["cons", 2, ["cons", 3, null]]]]]), 3);
		})();
	})();


}

test();