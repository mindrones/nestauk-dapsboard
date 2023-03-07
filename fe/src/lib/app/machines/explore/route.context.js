import {writable} from 'svelte/store';

export const createRouteStores = () => ({
	dataset: writable({}),
	queryURL: writable(''),
	_neededFields: writable([]),
});
