import { writable } from 'svelte/store';

export function createFormStores () {
	return {
		// user editable properties
		selection: writable({
			aggregation: null,
			field: null,
			type: null,
		}),
		params: writable({}),
		parsedQuery: writable(null),

		// computed select lists
		topBucketOptions: writable([]),
		bucketOptions: writable([]),
		bucketMultiFieldOptions: writable([]),
		nestedBucketOptions: writable([]),
		metricOptions: writable([]),
		metricMultiFieldOptions: writable([]),
		typeOptions: writable([]),
		datasetOptions: writable([]),
		fieldOptions: writable([]),

		// other computed properties
		aggParamsInfo: writable([]),
		computedQuery: writable({}),
		readyForRequest: writable(false),
		response: writable(null),
		responseStatus: writable({
			error: false,
			matching: false,
			pending: false,
		})
	}
}
