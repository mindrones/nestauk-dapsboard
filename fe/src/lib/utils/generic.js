/*
This file is imported by `src/bin/make_data.js`
- we can't import files generated by it like `data/datasets.json` in here
- we can't import @svizzle/ui as its index exports `.svelte` files
*/

import * as _ from 'lamb';
import {getId, isFunction} from '@svizzle/utils';

export const indexById = _.indexBy(getId);

// TODO -> evaluateIfFunction
export const evaluate = type => _.when(isFunction, _.applyTo([type]));

export const ifExistsGetKey = prop => _.casus(_.hasKey(prop), _.getKey(prop));

export const isKeyOf = _.curry(_.has);
export const getKeyOf = _.curry(_.getIn);

export const descentReducer = (hasChildren, getChildren) => {
	const reducer = _.curryable((reducerFn, init, node) => {
		const acc = reducerFn(init, node);
		if (!hasChildren(node)) {
			return acc;
		}
		return getChildren(node).reduce(reducer(reducerFn), acc);
	});
	return reducer;
}
