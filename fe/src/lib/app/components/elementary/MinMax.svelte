<script>
	import { createEventDispatcher } from 'svelte';
	import SimpleField from './SimpleField.svelte';

	const dispatch = createEventDispatcher();

	export let dataType = null;
	export let defaultValue = null;
	export let id = null;
	export let required = false;
	export let value = null;

	let type;
	let min;
	let max;
	let defaultMin;
	let defaultMax;
	let notEmpty = false;
	let complete = false;

	function handleValueChange (newValue) {
		if (newValue) {
			// eslint-disable-next-line prefer-destructuring
			min = newValue.min;
			// eslint-disable-next-line prefer-destructuring
			max = newValue.max;
			notEmpty = Boolean(min || max);
			complete = Boolean(min && max);
		} else {
			min = null;
			max = null;
			notEmpty = false;
			complete = false;
		}
	}
	function handleEditorChange (newValue) {
		let payload = null;
		if (complete) {
			payload = newValue;
		}
		dispatch('change', payload);
	}
	function handleChangeMin (event) {
		const newValue = {min: event.detail, max};
		handleValueChange(newValue);
		handleEditorChange(newValue);
	}
	function handleChangeMax (event) {
		const newValue = {min, max: event.detail};
		handleValueChange(newValue);
		handleEditorChange(newValue);
	}

	function handleFocus () {
		dispatch('focus');
	}
	function handleBlur () {
		dispatch('blur');
	}

	const types = {
		'integer': 'number',
		'float': 'number',
		'string': 'text',
	};

	$: type = types[dataType];
	$: handleValueChange(value);
	$: if (defaultValue) {
		defaultMin = defaultValue.min;
		defaultMax = defaultValue.max;
	} else {
		defaultMin = undefined;
		defaultMax = undefined;
	}
</script>

<div>
	<label for={`${id}-min`} class='min'>Min</label>
	<div class='min'>
		<SimpleField
			id={`${id}-min`}
			{type}
			{dataType}
			value={min}
			defaultValue={defaultMin}
			on:change={handleChangeMin}
			on:focus={handleFocus}
			on:blur={handleBlur}
			required={required || notEmpty}
		/>
	</div>
	<label for={`${id}-max`} class='max'>Max</label>
	<div class='max'>
		<SimpleField
			id={`${id}-max`}
			{type}
			{dataType}
			value={max}
			defaultValue={defaultMax}
			on:change={handleChangeMax}
			on:focus={handleFocus}
			on:blur={handleBlur}
			required={required || notEmpty}
		/>
	</div>
</div>

<style>
	div {
		display: grid;
		grid-template-areas: 'label1 label2' 'field1 field2';
		column-gap: 0.5em;
	}
	div.min {
		grid-area: field1;
	}
	div.max {
		grid-area: field2;
	}
	label.min {
		grid-area: label1;
	}
	label.max {
		grid-area: label2;
	}
</style>
