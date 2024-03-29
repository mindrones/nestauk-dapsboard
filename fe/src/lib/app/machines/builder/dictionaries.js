import DATASETS from '$lib/app/data/datasets.json';
import aggsIdByFieldType from '$lib/elasticsearch/config/aggsIdByFieldType.js';
import {
	metricLabels,
	metricMultiFieldLabels,
	bucketLabels,
	bucketMultiFieldLabels,
	topBucketLabels,
	nestedBucketLabels,
} from '$lib/elasticsearch/config/aggsLabels.js';
import {getESType, getSchema} from '$lib/utils/specs.js';

export const aggregations = {};
export const datasets = {};
export const fields = {};
export const types = {};

const fieldNamesSet = new Set();
const typeNamesSet = new Set();

for (let index in DATASETS) {
	const dataset = DATASETS[index];
	const newDataset = {
		aggregations: new Set(),
		types: new Set(),
		fields: new Set(),
		index
	};
	datasets[dataset.id] = newDataset;

	const schema = getSchema(dataset);
	for (let field in schema) {
		fieldNamesSet.add(field);
		newDataset.fields.add(field);

		const esType = getESType(schema[field]);
		typeNamesSet.add(esType)
		newDataset.types.add(esType);

		const aggs = aggsIdByFieldType[esType]
		if (aggs) {
			aggs.forEach(agg => {
				newDataset.aggregations.add(agg);
			})
		}
	}
}

export const typeNames = Array.from(typeNamesSet).sort();
for (let esType of typeNames) {
	types[esType] = {
		aggregations: new Set(aggsIdByFieldType[esType]),
		datasets: new Set(
			Object.keys(datasets)
			.filter(dsName => datasets[dsName].types.has(esType))
		),
		fields: new Set()
	}
}

export const fieldNames = Array.from(fieldNamesSet).sort();
for (let field of fieldNames) {
	const _datasets = new Set(
		Object.keys(datasets)
		.filter(dsName => datasets[dsName].fields.has(field))
	)
	const Types = new Set(
		Object.keys(datasets)
		.filter(dsName => datasets[dsName].fields.has(field))
		.map(dsName => getESType(getSchema(DATASETS[datasets[dsName].index])[field]))
	);
	const _aggregations = new Set();
	for (let esType of Types) {
		const aggs = aggsIdByFieldType[esType];
		if (aggs) {
			aggs.forEach(agg => _aggregations.add(agg));
		}
		types[esType].fields.add(field);
	}
	fields[field] = {
		datasets: _datasets,
		types: Types,
		aggregations: _aggregations
	};
}

for (let agg of Object.keys({
	...metricLabels,
	...metricMultiFieldLabels,
	...bucketLabels,
	...bucketMultiFieldLabels,
	...topBucketLabels,
	...nestedBucketLabels
})) {
	aggregations[agg] = {
		types: new Set(
			Object.keys(types)
			.filter(esType => types[esType].aggregations.has(agg))
		),
		datasets: new Set(
			Object.keys(datasets)
			.filter(dsName => datasets[dsName].aggregations.has(agg))
		),
		fields: new Set(
			Object.keys(fields)
			.filter(field => fields[field].aggregations.has(agg))
		)
	}
}
