import {esSearchableField} from '$lib/elasticsearch/aggs/ref/typeGroups.js';
import {string} from '$lib/types/index.js';
import {field} from '$lib/elasticsearch/aggs/ref/requestDoc.js';
import response from '$lib/elasticsearch/aggs/response/docCount.js';

export default {
	id: 'missing',
	availability: {
		from: '1.3'
	},
	docPath: '/search-aggregations-bucket-missing-aggregation.html',
	docs: 'A field data based single bucket aggregation, that creates a bucket of all documents in the current document set context that are missing a field value (effectively, missing a field or having the configured NULL value set).',
	fieldType: esSearchableField,
	label: 'Missing',
	request: {// [0]
		field: string,
	},
	requestDoc: {
		field,
	},
	response,
	subAggs: true,
	tag: 'bucketing',
	version: '7.9',
};

// [0] 7.9: no params table
