export type LeftProps<T> = {
	left: T;
	right?: never;
};

export type RightProps<T> = {
	left?: never;
	right: T;
};

export type EitherProps<T, U> = NonNullable<LeftProps<T> | RightProps<U>>;

export type UnwrapEitherProps = <T, U>(
	e: EitherProps<T, U>,
) => NonNullable<T | U>;

export default class Either {
	public UnwrapEither = <T, U>(param: EitherProps<T, U>) => {
		if (param.left !== undefined && param.right !== undefined) {
			throw new Error(
				`Received both left and right values at runtime when opening an Either\nLeft: ${JSON.stringify(param.left)}\nRight: ${JSON.stringify(param.right)}`,
			);
		}

		if (param.left !== undefined) {
			return param.left as NonNullable<T>; // Typescript is getting confused and returning this type as `T | undefined` unless we add the type assertion
		}

		if (param.right !== undefined) {
			return param.right as NonNullable<U>;
		}

		throw new Error(
			'Received no left or right values at runtime when opening Either',
		);
	};

	static IsLeft = <T, U>(param: EitherProps<T, U>): param is LeftProps<T> => {
		return param.left !== undefined;
	};

	static IsRight = <T, U>(e: EitherProps<T, U>): e is RightProps<U> => {
		return e.right !== undefined;
	};

	static Left = <T>(value: T): LeftProps<T> => ({ left: value });

	static Right = <U>(value: U): RightProps<U> => ({ right: value });
}
