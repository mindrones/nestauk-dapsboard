<script context='module'>
	function pad (num, size) {
		return `${num}`.padStart(size, '0');
	}

	function date_YYYYMMDD_dash (date) {
		return `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`;
	}

	const whitespaceMatcher = /\s+/gu;
	function formatPlaceholder (string) {
		return string.replace(whitespaceMatcher, ' ');
	}
</script>

<script>
	import areEqual from 'just-compare';
	import { createEventDispatcher } from 'svelte';
	import {isNotNil} from '@svizzle/utils';

	import AutoComplete from './AutoComplete.svelte';

	const dispatch = createEventDispatcher();

	export let id = null;
	export let type = 'text';
	export let dataType = 'text';
	export let value = null;
	export let defaultValue;
	export let required;
	export let suggestions;

	let fieldValue;
	let currentValue = value;
	let isDefaultValue = false;
	let active = false;

	const incomingFormatters = {
		'integer': v => v.toString(),
		'float': v => v.toString(),
		'date_YYYYMMDD_dash': dateString =>
			date_YYYYMMDD_dash(new Date(dateString)),
		'json': obj => obj ? JSON.stringify(obj) : null
	}

	const outgoingFormatters = {
		'integer': parseInt,
		'float': parseFloat,
		'date_YYYYMMDD_dash': dateString =>
			date_YYYYMMDD_dash(new Date(dateString)),
		'json': obj => {
			let result = null;
			if (isNotNil(obj)) {
				try {
					result = JSON.parse(obj);
				} catch (e) {
					console.log('Problem parsing JSON, aborting dispatch...', e);
				}
			}
			return result;
		}
	}

	function formatIncomingValue (incomingValue) {
		let result;
		if (
			dataType in incomingFormatters
			&& isNotNil(incomingValue)
		) {
			result = incomingFormatters[dataType](incomingValue);
		} else if (type === 'json') {
			result = incomingFormatters.json(incomingValue);
		} else {
			result = incomingValue || '';
		}
		return result;
	}

	function parseOutgoingValue (outgoingValue) {
		let outgoing = outgoingValue;
		if (dataType in outgoingFormatters) {
			outgoing = outgoing && outgoing.length > 0
				? outgoingFormatters[dataType](outgoing)
				: null;
		} else if (type === 'json') {
			outgoing = outgoingFormatters.json(outgoing);
		}
		return outgoing;
	}

	function notify (payload) {
		dispatch('change', parseOutgoingValue(payload));
	}

	function handleFocus () {
		dispatch('docs', 'set');
		active = true;
	}

	function handleBlur () {
		dispatch('docs', 'unset');
		setTimeout(() => {
			active = false
		}, 100);
	}

	function handleChange (event) {
		notify(event.target.value);
	}

	function handleInput (event) {
		currentValue = event.target.value;
		// TODO Perhaps we need to handle validation as well
	}

	function handleValueChange (newValue) {
		fieldValue = formatIncomingValue(newValue);
	}

	function handleFieldValueChange (newFieldValue) {
		currentValue = newFieldValue;
	}

	function handleSuggestionSelected (event) {
		notify(event.detail);
		active = false;
	}

	$: handleValueChange(value);
	$: handleFieldValueChange(fieldValue);
	$: isDefaultValue = areEqual(parseOutgoingValue(currentValue), defaultValue);
</script>

<input {id} {type} value={fieldValue}
	on:change={handleChange}
	on:input={handleInput}
	on:focus={handleFocus}
	on:blur={handleBlur}
	placeholder={formatPlaceholder(dataType)}
	title={!active ? dataType : null}
	class:required
	class:empty={currentValue === ''}
	class:default={isDefaultValue}
	autocomplete={!suggestions ? 'on' : 'off'}
>
{#if suggestions}
	<div class='autocomplete'>
		<AutoComplete list={suggestions} {active} value={currentValue} on:selected={handleSuggestionSelected} />
	</div>
{/if}

<style>
	input:not([type='checkbox']):not([type='date']):not([type='radio']) {
		width: 100%;
	}
	.required.empty {
		background-color: #ffcbcb;
		border: 1px solid red;
	}
	.default {
		background-color: #fff1ff;
		border: 1px solid grey;
	}
	.autocomplete {
		position: relative;
		width:100%;
	}
</style>
