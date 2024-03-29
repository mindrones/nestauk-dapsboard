import {esSearchableString} from '$lib/elasticsearch/aggs/ref/typeGroups.js';
import {
	optional,
	termsExclude,
	termsInclude,
} from '$lib/elasticsearch/types/params.js';
import {
	floatD,
	integerD,
	string,
} from '$lib/types/index.js';
import {
	field,
	missing,
	termsExclude as termsExcludeDoc,
	termsInclude as termsIncludeDoc,
} from '$lib/elasticsearch/aggs/ref/requestDoc.js';
import response from '$lib/elasticsearch/aggs/response/bucketsDocCount.js';

export default {
	id: 'rare_terms',
	availability: {
		from: '7.3'
	},
	collect_mode: `breadth_first`,
	docPath: '/search-aggregations-bucket-rare-terms-aggregation.html',
	docs: 'Multi-bucket value source based aggregation which finds "rare" terms - terms that are at the long-tail of the distribution and are not frequent.',
	fieldType: esSearchableString,
	label: 'Rare terms',
	request: { // [1]
		exclude: optional(termsExclude),
		field: string,
		include: optional(termsInclude),
		max_doc_count: optional(integerD(1)),
		missing: optional(string),
		precision: optional(floatD(0.01)),
	},
	requestDoc: {
		exclude: termsExcludeDoc,
		field,
		include: termsIncludeDoc,
		max_doc_count: 'The maximum number of documents a term should appear in.',
		missing,
		precision: 'The precision of the internal CuckooFilters. Smaller precision leads to better approximation, but higher memory usage. Cannot be smaller than 0.00001. Default 0.01',
	},
	response,
	subAggs: true,
	tag: 'bucketing',
	version: '7.9',
};

// [1] params table at: https://www.elastic.co/guide/en/elasticsearch/reference/7.9/search-aggregations-bucket-rare-terms-aggregation.html#_syntax
