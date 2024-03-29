import * as _ from 'lamb';
import {get} from 'svelte/store';
import {assign, sendParent} from 'xstate';
import {
	isNotNull,
	isNotNil,
	isObjEmpty,
	isObjNotEmpty
} from '@svizzle/utils';

import {
	aggregations,
	datasets,
	fields,
	types,
	fieldNames
} from '$lib/app/machines/builder/dictionaries.js';
import DATASETS from '$lib/app/data/datasets.json';
import {
	getDefault,
	hasDefault,
	is_extent,
	is_intWithUnit,
	is_object,
	is_xor,
	isNative,
} from '$lib/types/index.js';
import {
	metricLabels,
	metricMultiFieldLabels,
	topBucketLabels,
	bucketLabels,
	bucketMultiFieldLabels,
	nestedBucketLabels
} from '$lib/elasticsearch/config/aggsLabels.js';
import {is_optional} from '$lib/elasticsearch/types/params.utils.js';
import {request} from '$lib/utils/net.js';
import {getEsSearchURL, getESType, getSchema} from '$lib/utils/specs.js';
import {getParamsInfo, mergeDocs} from '$lib/elasticsearch/utils/aggParams.js';
import {buildAggregation} from '$lib/elasticsearch/utils/aggQuery.js';

import aggParamsShapeByFieldtypeByAggId from '$lib/elasticsearch/config/aggParamsShapeByFieldtypeByAggId.js';
import aggParamDocByAggId from '$lib/elasticsearch/config/aggParamDocByAggId.js';

function setSelection (ctx, event) {
	ctx.selection.set({
		...get(ctx.selection),
		...event.selection
	});
	if ('dataset' in event) {
		ctx.dataset.set(event.dataset);
	}
	return ctx;
}

const isMissing = (key, value) => obj => Boolean(obj)
	&& !obj[key].has(value);

const isTopLevel = ctx => ctx.arrayIndex === 0

function computeLists (ctx) {
	const nextSelection = get(ctx.selection);
	const dataset = get(ctx.dataset);
	const typeDicts = types[nextSelection.type];
	const fieldDicts = fields[nextSelection.field];
	const datasetDicts = datasets[dataset];
	const aggDicts = aggregations[nextSelection.aggregation];

	ctx.topBucketOptions.set(Object.keys(topBucketLabels).map(agg => ({
		text: topBucketLabels[agg],
		value: agg,
		disabled:
			[typeDicts, datasetDicts, fieldDicts]
			.some(isMissing('aggregations', agg))
			|| !isTopLevel(ctx)
	})));
	ctx.bucketOptions.set(Object.keys(bucketLabels).map(agg => ({
		text: bucketLabels[agg],
		value: agg,
		disabled:
			[typeDicts, datasetDicts, fieldDicts]
			.some(isMissing('aggregations', agg))
	})));
	ctx.bucketMultiFieldOptions.set(Object.keys(bucketMultiFieldLabels).map(agg => ({
		text: bucketMultiFieldLabels[agg],
		value: agg,
		disabled:
			[typeDicts, datasetDicts, fieldDicts]
			.some(isMissing('aggregations', agg))
	})));
	ctx.nestedBucketOptions.set(Object.keys(nestedBucketLabels).map(agg => ({
		text: nestedBucketLabels[agg],
		value: agg,
		disabled:
			[typeDicts, datasetDicts, fieldDicts]
			.some(isMissing('aggregations', agg))
			|| isTopLevel(ctx)
	})));
	ctx.metricOptions.set(Object.keys(metricLabels).map(agg => ({
		text: metricLabels[agg],
		value: agg,
		disabled:
			[typeDicts, datasetDicts, fieldDicts]
			.some(isMissing('aggregations', agg))
	})));
	ctx.metricMultiFieldOptions.set(Object.keys(metricMultiFieldLabels).map(agg => ({
		text: metricMultiFieldLabels[agg],
		value: agg,
		disabled:
			[typeDicts, datasetDicts, fieldDicts]
			.some(isMissing('aggregations', agg))
	})));
	ctx.typeOptions.set(Object.keys(types).map(type => ({
		text: type,
		value: type,
		disabled: false,
		effaced:
			[aggDicts, datasetDicts, fieldDicts]
			.some(isMissing('types', type))
	})));
	ctx.datasetOptions.set(DATASETS.map(dset => ({
		text: dset.id,
		value: dset.id,
		disabled:
			[typeDicts, fieldDicts, aggDicts]
			.some(isMissing('datasets', dset.id))
	})));
	// TODO #195 fix goes here mostly
	ctx.fieldOptions.set(fieldNames.map(field => ({
		text: field,
		value: field,
		disabled:
			!dataset
			|| [typeDicts, datasetDicts, aggDicts]
			.some(isMissing('fields', field))
	})));
	return ctx;
}

function getAggType (datasetId, {field, aggregation}) {
	const dset = DATASETS.find(ds => datasetId === ds.id);
	const fieldInfo = getSchema(dset)[field];
	const fieldType = getESType(fieldInfo);
	return aggParamsShapeByFieldtypeByAggId[fieldType][aggregation];
}
function computeTypings (ctx) {
	const selection = get(ctx.selection);
	const dataset = get(ctx.dataset);

	const aggType = getAggType(dataset, selection);
	const partialParamsInfo = getParamsInfo(aggType);

	const docs = aggParamDocByAggId[selection.aggregation];
	const paramsInfo = mergeDocs(partialParamsInfo, docs);

	ctx.aggParamsInfo.set(paramsInfo);
	return ctx;
}

const extractDefaultValue = _.adapter([
	_.casus(hasDefault, getDefault),
	_.casus(
		_.not(isNative),
		_.pipe([
			getParamsInfo,
			// eslint-disable-next-line no-use-before-define
			extractDefaultValues,
		])
	)
]);
const extractChildDefaults = _.pipe([
	_.mapWith(({paramId, type}) => [paramId, extractDefaultValue(type)]),
	_.filterWith(_.pipe([_.getAt(1), isNotNil])),
	_.casus(_.every(_.pipe([_.getAt(1), isNotNil])), _.fromPairs),
]);
function extractDefaultValues (aggParamsInfo) {
	if (aggParamsInfo.length === 0) {
		return undefined;
	}
	const childDefaults = extractChildDefaults(aggParamsInfo);
	if (isObjEmpty(childDefaults)) {
		return undefined;
	}
	return childDefaults;
}

function computeDefaultValues (ctx) {
	const aggParamsInfo = get(ctx.aggParamsInfo);
	const defaultValues = extractDefaultValues(aggParamsInfo);
	if (!get(ctx.isParsing)) {
		ctx.params.set({
			...defaultValues,
			...get(ctx.params)
		});
	}
}

const isValidNative = (value, type) => isNotNil(value) && isNative(type);
const has_children = _.allOf([isNotNil, isObjNotEmpty]);
const has_empty_object_default = _.allOf([
	is_optional,
	hasDefault,
	_.pipe([getDefault, isObjEmpty])
]);

const makeChildrenReducer = value => (acc, paramInfo) => {
	let key = paramInfo.paramId;
	let obj = value[key];
	if (obj === undefined) {
		return acc;
	}
	let currentType = paramInfo.type;
	if (is_xor(currentType)) {
		key = obj.__selection;
		obj = obj[key];
		currentType = currentType[key];
	}
	// eslint-disable-next-line no-use-before-define
	const childParams = obj && processRequestValue(obj, currentType);
	if (
		isValidNative(childParams, currentType)
		|| has_children(childParams)
		|| has_empty_object_default(currentType)
	) {
		acc[key] = childParams;
	}
	return acc;
};

function processRequestValue (value, type) {
	if (isNative(type)) {
		return value;
	}
	if (is_intWithUnit(type)) {
		return `${value.value}${value.unit}`;
	}
	if (is_object(type) || is_extent(type) || is_xor(type)) {
		const paramsInfo = getParamsInfo(type);
		const cookedParams = _.reduce(paramsInfo, makeChildrenReducer(value), {});
		return cookedParams;
	}
	return undefined;
}

function computeAggParams (
	ctx,
	arrayIndex,
	dataset,
	subresults
) {
	const form = get(ctx.forms)[arrayIndex];
	const machine = get(form.machine);

	const name = machine.context.id;
	const selection = get(machine.context.selection);
	const extendedParams = get(machine.context.params);
	const aggParamsInfo = get(machine.context.aggParamsInfo);

	const dset = DATASETS.find(ds => dataset === ds.id)
	const fieldInfo = getSchema(dset)[selection.field];

	const basicParams = buildAggregation(
		selection.aggregation,
		selection.field,
		fieldInfo
	);
	const rawParams = {
		...extendedParams,
		...basicParams,
	};
	const aggParams = rawParams && processRequestValue(
		rawParams,
		getAggType(dataset, selection)
	);

	const agg = {
		[selection.aggregation]: aggParams
	};

	let isRequiredSet = true;
	if (subresults) {
		agg.aggs = subresults.query;
		isRequiredSet = isRequiredSet && subresults.isRequiredSet;
	}
	isRequiredSet = isRequiredSet && aggParamsInfo.every(info => {
		const params = rawParams[info.paramId];
		return info.paramId === 'field'
			|| !info.required
			|| is_xor(info.type)
			&& isNotNil(params?.[params?.__selection])
			|| isNotNil(params)
	});
	const query = {
		[name]: agg
	};
	const result = {
		isRequiredSet,
		query,
	};
	if (arrayIndex === 0) {
		return result;
	}
	return computeAggParams(
		ctx,
		arrayIndex - 1,
		dataset,
		result
	);
}

function computeRequest (ctx) {
	ctx.readyForRequest.set(false);
	const dataset = get(ctx.dataset);
	const aggParams = computeAggParams(
		ctx,
		ctx.arrayIndex,
		dataset
	);
	const requestBody = {
		size: get(ctx.resultSize),
		aggs: aggParams.query
	};
	ctx.computedQuery.set(requestBody);
	ctx.readyForRequest.set(aggParams.isRequiredSet);
	ctx.url = getEsSearchURL(DATASETS.find(ds => dataset === ds.id));

	return ctx;
}

function getQuery (ctx) {
	const cQuery = get(ctx.computedQuery);
	const pQuery = get(ctx.parsedQuery);
	return get(ctx.selectedRequestTab) === 'fields'
		? cQuery
		: pQuery || cQuery;
}

function computeCacheKey (ctx) {
	ctx.cacheKey = `${ctx.url}/${JSON.stringify(getQuery(ctx))}`;
	return ctx;
}

function setQuery (ctx, event) {
	// merge
	const params = {
		...get(ctx.params),
		...event.params
	};
	// delete nulled parameters
	Object.keys(params).forEach(k => {
		params[k] === null && delete params[k];
		if (typeof params[k] === 'object') {
			Object.keys(params[k]).forEach(k2 => {
				params[k][k2] === null && delete params[k][k2];
			});
		}
	});
	ctx.params.set(params);
	if (isNotNil(event.resultSize)) {
		ctx.resultSize.set(event.resultSize);
	}
	return ctx;
}

function setJSON (ctx, event) {
	ctx.parsedQuery.set(event.json);
	return ctx;
}

function clearTypings (ctx) {
	ctx.aggParamsInfo.set([]);
	return ctx;
}

function clearQuery (ctx) {
	ctx.params.set({});
	ctx.computedQuery.set({});
	return ctx;
}

// Storing the cache globally as it can be shared safely among instances.
const cache = {};
function doQuery (ctx) {
	ctx.response.set(null);
	return request('POST', ctx.url, {data: getQuery(ctx)});
}

function isInCache (ctx) {
	return ctx.cacheKey in cache;
}

function isMatching (ctx) {
	return get(ctx.response) && ctx.cacheKey === `${ctx.url}/${JSON.stringify(getQuery(ctx))}`;
}

function loadFromCache (ctx) {
	ctx.response.set(cache[ctx.cacheKey]);
	return ctx;
}

function storeInCache (ctx, event) {
	cache[ctx.cacheKey] = event.data;
	return ctx;
}
function setNotReadyStatus (ctx) {
	ctx.responseStatus.set({
		error: false,
		matching: false,
		pending: false,
	});
	return ctx;
}
function setErrorStatus (ctx) {
	ctx.responseStatus.set({
		error: true,
		matching: false,
		pending: false,
	});
	return ctx;
}
function setMatchingStatus (ctx) {
	ctx.responseStatus.set({
		error: false,
		matching: true,
		pending: false,
	});
	return ctx;
}
function setPendingStatus (ctx) {
	ctx.responseStatus.set({
		error: false,
		matching: false,
		pending: true,
	});
}
function setResponse (ctx, event) {
	ctx.response.set(event.data)
	return ctx;
}

function rename (ctx, event) {
	const newName = event.name;
	ctx.id = newName;
}

function setErrorResponse (ctx, event) {
	ctx.response.set(event.data.jsonMessage)
}

export const formOptions = {
	actions: {
		/**
		 * Clear the input values if the query configuration changes.
		 */
		clearQuery: assign(clearQuery),
		/**
		 * Reset the types for form inputs if the query configuration changes.
		 */
		clearTypings: assign(clearTypings),
		/**
		 * Compute default values for the current selection.
		 */
		computeDefaultValues: assign(computeDefaultValues),
		/**
		 * Compute the lists of selectable choices for configuring the query.
		 */
		computeLists: assign(computeLists),
		/**
		 * Compute a unique key for storing query responses in the cache.
		 */
		computeCacheKey: assign(computeCacheKey),
		/**
		 * Compute the request body.
		 */
		computeRequest: assign(computeRequest),
		/**
		 * Compute the property types for the currently configured query.
		 */
		computeTypings: assign(computeTypings),
		/**
		 * Load a query from the cache.
		 */
		loadFromCache: assign(loadFromCache),
		/**
		 * Rename the form.
		 */
		rename: assign(rename),
		/**
		 * Notifies parent that query was requested.
		 */
		sendCommitted: sendParent(ctx => ({
			type: 'COMMITTED',
			formId: ctx.id
		}), {delay: 1}),
		/**
		 * Notifies parent that query was requested.
		 */
		sendEdited: sendParent('EDITED'),
		/**
		 * Notifies sub aggregation that the tree has changed
		 */
		sendFormChanged: sendParent(ctx => ({
			type: 'FORM_CHANGED',
			formId: ctx.id
		})),
		/**
		 * Creates a new form for configuring a subaggregation.
		 */
		sendSelectionComplete: sendParent(ctx => ({
			type: 'SELECTION_COMPLETED',
			formId: ctx.id,
			selection: get(ctx.selection)
		})),
		/**
		 * Notify the parent that the selection is now incomplete
		 */
		sendSelectionIncomplete: sendParent(ctx => ({
			type: 'SELECTION_INCOMPLETE',
			formId: ctx.id,
		})),
		/**
		 * Set the response status to dirty.
		 */
		setNotReadyStatus: assign(setNotReadyStatus),
		/**
		 * Sets the error response in the context after a failed request.
		 */
		setErrorResponse: assign(setErrorResponse),
		/**
		 * Set the response status to error.
		 */
		setErrorStatus: assign(setErrorStatus),
		/**
		 * Directly edit the query JSON to be requested.
		 */
		setJSON: assign(setJSON),
		/**
		 * Set the response status to matching.
		 */
		setMatchingStatus: assign(setMatchingStatus),
		/**
		 * Set the response status to pedning.
		 */
		setPendingStatus: assign(setPendingStatus),
		/**
		 * Store changes in input values in the context.
		 */
		setQuery: assign(setQuery),
		/**
		 * Store the response in the context.
		 */
		setResponse: assign(setResponse),
		/**
		 * Updates stores to reflect current aggregation parts selection.
		 */
		setSelection: assign(setSelection),
		/**
		 * Store the response in the cache.
		 */
		storeInCache: assign(storeInCache),
	},
	guards: {
		isAutoExecute: ctx => get(ctx.runQueryOnSelect),
		isInCache,
		isMatching,
		isQueryReady: ctx => get(ctx.readyForRequest),
		isSelectionComplete: ({selection, dataset}) => {
			const sel = get(selection);
			return isNotNull(sel.aggregation)
				&& isNotNull(get(dataset))
				&& isNotNull(sel.field);
		},
	},
	services: {
		apiRequest: ctx => doQuery(ctx),
	}
};
