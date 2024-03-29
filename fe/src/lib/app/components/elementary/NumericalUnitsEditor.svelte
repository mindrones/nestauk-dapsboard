<script>
	import { createEventDispatcher } from 'svelte';
	import { isNotNull } from '@svizzle/utils';

	import SimpleField from './SimpleField.svelte';
	import RadioList from './RadioList.svelte';

	const dispatch = createEventDispatcher();
	const valueOrEmpty = v => v || '';

	export let defaultValue = null;
	export let id = null;
	export let required = false;
	export let value = null;
	export let unitList = [];

	let defaultNumeric;
	let defaultUnit;
	let numericValue;
	let notEmpty = false;
	let unitValue;

	function extractUnitValue (v) {
		let unit = v.match(/[a-zA-Z]+/gu);
		return unit?.length > 0 ? unit[0] : null;
	}

	function handleValueChange (newValue) {
		if (newValue) {
			numericValue = parseInt(newValue, 10);
			unitValue = extractUnitValue(newValue);
			notEmpty = isNotNull(numericValue) || isNotNull(unitValue);
		} else {
			numericValue = null;
			unitValue = null;
			notEmpty = false;
		}
	}
	function handleEditorChange (newValue) {
		dispatch('change', newValue);
	}
	function handleChangeNumeric (event) {
		const part = event.detail;
		const newValue = `${valueOrEmpty(part)}${valueOrEmpty(unitValue)}`;
		numericValue = event.detail;
		handleValueChange(newValue)
		handleEditorChange(newValue);
	}
	function handleChangeUnit (event) {
		const part = event.detail;
		const newValue = `${valueOrEmpty(numericValue)}${valueOrEmpty(part)}`;
		handleValueChange(newValue)
		handleEditorChange(newValue);
	}

	function handleFocus () {
		dispatch('focus');
	}
	function handleBlur () {
		dispatch('blur');
	}

	$: handleValueChange(value);
	$: if (defaultValue) {
		defaultNumeric = parseInt(defaultValue, 10);
		defaultUnit = extractUnitValue(defaultValue);
	} else {
		defaultNumeric = undefined;
		defaultUnit = undefined;
	}
</script>

<div>
	<div class='numeric'>
		<SimpleField
			id={`${id}-numeric`}
			type='number'
			dataType='integer'
			value={numericValue}
			defaultValue={defaultNumeric}
			on:change={handleChangeNumeric}
			on:focus={handleFocus}
			on:blur={handleBlur}
			required={required || notEmpty}
		/>
	</div>
	<div class='unit'>
		<RadioList
			id={`${id}-unit`}
			typeObject={unitList}
			value={unitValue}
			defaultValue={defaultUnit}
			on:change={handleChangeUnit}
			on:focus={handleFocus}
			on:blur={handleBlur}
			required={required || notEmpty}
		/>
	</div>
</div>

<style>
	div {
		display: grid;
		grid-template-areas: 'field1 field2';
		column-gap: 0.5em;
	}
	div.numeric {
		grid-area: field1;
	}
	div.unit {
		grid-area: field2;
	}
</style>
