# ElasticSearch Aggregations

## Composition Rules

* Metric aggregations can't have children
* Most bucketing aggregations can have other bucketing or metric
	aggregations as children.
* The `Global` aggregator can only be top level.
* The `Reverse Nested` aggregator can only be defined inside a `Nested`
	aggregation.
* The `Significant Text` aggregation can be used anywhere but:
	> Re-analyzing large result sets will require a lot of time and memory. It is
	> recommended that the `significant_text` aggregation is used as a child of
	> either the `sampler` or `diversified sampler` aggregation to limit the
	> analysis to a small selection of top-matching documents e.g. 200. This will
	> typically improve speed, memory use and quality of results.


# ElasticSearch Filters

## `geo_bounding_box`

See https://www.elastic.co/guide/en/elasticsearch/reference/7.0/search-aggregations-bucket-geotilegrid-aggregation.html#_high_precision_requests_2

> When requesting detailed buckets (typically for displaying a "zoomed in" map) a filter like `geo_bounding_box` should be applied to narrow the subject area otherwise potentially millions of buckets will be created and returned.
