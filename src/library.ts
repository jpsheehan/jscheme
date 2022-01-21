import { Env } from "./types"

const library: Env = {
	"identity": ["lambda", ["x"], "x"],

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

	// "list": ["lambda", [".", "xs"], ["apply", "identity", "xs"]],

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

	"reverse":
		["lambda", ["coll"],
			["if", ["nil?", "coll"],
				null,
				["cons", ["last", "coll"], ["reverse", ["init", "coll"]]]]],

	"init":
		["lambda", ["coll"],
			["if", ["nil?", "coll"],
				null,
				["if", ["nil?", ["cdr", "coll"]],
					null,
					["cons", ["car", "coll"], ["init", ["cdr", "coll"]]]]]],

	"last":
		["lambda", ["coll"],
			["if", ["nil?", "coll"],
				null,
				["if", ["nil?", ["cdr", "coll"]],
					["car", "coll"],
					["last", ["cdr", "coll"]]]]],
}

export default library;