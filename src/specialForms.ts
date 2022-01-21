import { Env, Expr } from "./types"
import { foo } from "./index"

const specialForms: Env = {
	"lambda": function (this: Env, formals: string[], ...body: Expr[]) {
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
		if (formals.some((formal: string, i: number) => formals.slice(i + 1).some(x => x === formal))) {
			throw new Error("formal parameters must be unique");
		}

		return function (...args: Expr[]) {
			checkArity();
			const appliedArgs: Env = {};
			if (isVariadic) {
				const requiredFormals = formals.slice(0, requiresNArguments);
				const variadicFormal = formals[formals.length - 1];
				requiredFormals.forEach((formal, i) => appliedArgs[formal] = foo.call(env, args[i]));
				appliedArgs[variadicFormal] = args.slice(requiresNArguments);

			} else {
				formals.forEach((formal, i) => appliedArgs[formal] = foo.call(env, args[i]));
			}
			if (body.length === 0) {
				throw new Error("lambda expected a body");
			}
			// console.log(appliedArgs)
			return foo.apply({ ...env, ...appliedArgs }, (body as [expr: Expr]));

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
	"define": function (this: Env, name: Expr, ...value: Expr[]) {
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
			if (name.some(n => typeof n !== "string")) {
				throw new Error("define expects formals to be strings.");
			}

			const formals: string[] = (name as string[]).slice(1);
			env[name[0]] = foo.call(env, ["lambda", formals, ...value]);//specialForms.lambda?.call(env, formals, ...value);
		}
		return null;
	},
	"if": function (predicate: Expr, consequent: Expr, alternative: Expr) {
		const env = this;
		if (isTruthy(foo.call(env, predicate))) {
			return foo.call(env, consequent);
		} else {
			return foo.call(env, alternative);
		}

		function isTruthy(x: Expr) {
			return !!x;
		}
	}
}

export default specialForms;
