import {Env, Expr} from "./types"
import specialForms from "./specialForms";
import defaultForms from "./defaultForms"
import library from "./library"

export function getDefaultEnvironment(): Env {
	const env = {
		...specialForms,
		...defaultForms,
		...library
	};
	return env;
}

export function foo(this: Env, expr: Expr): Expr {
	if (typeof expr === "string") {
		return (this as Env)[expr];
	}
	if (Array.isArray(expr)) {
		if (expr.length === 0)
			return null;
		const fn = foo.call(this, foo.call(this, expr[0]));
		if (typeof fn === "function") {
			const args = expr.slice(1);
			return fn.apply(this, args);
		}
		// console.error(fn)
		throw new Error("Cannot call non-function")
	}
	return expr;
}
