import { Env, Expr } from "./types"
import { foo } from "./index"

const defaultForms: Env = {
	"*": function (this: Env, ...xs: Expr[]) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			const left = foo.call(env, x);
			if (typeof left !== "number") {
				throw new Error("* expects number")
			}
			const right = foo.call(env, y);
			if (typeof right !== "number") {
				throw new Error("* expects number");
			}
			return left * right;
		}, foo.call(env, xs[0])) ?? 1;
	},
	"/": function (this: Env, ...xs: Expr[]) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			const left = foo.call(env, x);
			if (typeof left !== "number") {
				throw new Error("/ expects number");
			}
			const right = foo.call(env, y);
			if (typeof right !== "number") {
				throw new Error("/ expects number");
			}
			if (right === 0) {
				throw new Error("/ expects non-zero dividend")
			}
			return left / right;
		}, foo.call(env, xs[0])) ?? 1;
	},
	"+": function (this: Env, ...xs: Expr[]) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			const left = foo.call(env, x);
			if (typeof left !== "number") {
				throw new Error("+ expects number")
			}
			const right = foo.call(env, y);
			if (typeof right !== "number") {
				throw new Error("+ expects number");
			}
			return left + right;
		}, foo.call(env, xs[0])) ?? 0;
	},
	"-": function (this: Env, ...xs: Expr[]) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			const left = foo.call(env, x);
			if (typeof left !== "number") {
				throw new Error("- expects number")
			}
			const right = foo.call(env, y);
			if (typeof right !== "number") {
				throw new Error("- expects number");
			}
			return left - right;
		}, foo.call(env, xs[0])) ?? 0;
	},
	"=": function (this: Env, ...xs: Expr[]) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			return foo.call(env, x) === foo.call(env, y);
		}, foo.call(env, xs[0])) ?? true;
	},
	"%": function (this: Env, ...xs: Expr[]) {
		const env = this;
		return xs.slice(1).reduce(function (x, y) {
			const left = foo.call(env, x);
			if (typeof left !== "number") {
				throw new Error("% expects number")
			}
			const right = foo.call(env, y);
			if (typeof right !== "number") {
				throw new Error("% expects number");
			}
			if (right === 0) {
				throw new Error("% expects non-zero dividend");
			}
			return left % right;
		}, foo.call(env, xs[0]));
	},
	"apply": function (this: Env, fn: Expr, args: Expr) {
		const env = this;
		const argsToApply = foo.call(env, args);
		if (!Array.isArray(argsToApply)) {
			throw new Error("apply expects a list of values")
		}
		return foo.call(env, [foo.call(env, fn), ...argsToApply]);
	},
	"quote": function (this: Env, x: Expr) {
		return x;
	},
	"list": function (this: Env, ...xs: Expr[]) {
		const env = this;
		return xs
			.reduceRight((x, y) => foo
				.call(env, ["cons", y, foo.call(env, x)]),
				foo.call(env, null));
	},
	"not": function (this: Env, x: Expr) {
		const env = this;
		return foo.call(env, x) ? false : true;
	}
}

export default defaultForms;