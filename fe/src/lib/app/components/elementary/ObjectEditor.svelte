<script>
	import { createEventDispatcher } from 'svelte';
	import { getParamsInfo } from '$lib/elasticsearch/utils/aggParams.js';
	import { is_xor, is_intWithUnit } from '$lib/types/index.js';
	import TypedField from '$lib/app/components/elementary/TypedField.svelte';

	const dispatch = createEventDispatcher();

	export let typeObject;
	export let editedValue = null;
	export let id = null;
	export let value = null;
	export let required = false;

	let aggParamsInfo = [];
	let isParamSelector = false;

	function getFieldValue (name) {
		return value?.[name];
	}

	function handleChange (change) {
		editedValue = {
			...editedValue,
			...change
		}
		dispatch('change', editedValue);
	}

	$: editedValue = value;
	$: aggParamsInfo = getParamsInfo(typeObject);
	$: isParamSelector = is_xor(typeObject);
	$: isIntWithUnits = is_intWithUnit(typeObject);
</script>

<div>
	{#each aggParamsInfo as paramInfo (`${id}-${paramInfo.paramId}`)}
		{#if !isParamSelector
			|| ['__selection', value?.__selection].includes(paramInfo.paramId)
		}
			<TypedField
				labelText={isParamSelector || isIntWithUnits ? '' : paramInfo.paramId}
				required={isParamSelector
					? required
					: required && paramInfo.required
				}
				dataType={paramInfo.displayText}
				typeObject={paramInfo.type}
				value={getFieldValue(paramInfo.paramId)}
				on:change={event => handleChange({[paramInfo.paramId]: event.detail})}
				help={false}
			/>
		{/if}
	{/each}
</div>

<style>
div {
	padding-left: 1em;
	border-left: 1px solid lightgray;
}
</style>
