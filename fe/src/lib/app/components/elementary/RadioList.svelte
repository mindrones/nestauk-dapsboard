<script>
	import {createEventDispatcher} from 'svelte';
	import {isNil} from 'lamb';

	const dispatch = createEventDispatcher();

	export let id = null;
	export let required = false;
	export let value = null;
	export let defaultValue;
	export let typeObject;

	function handleFocus () {
		dispatch('focus');
	}

	function handleBlur () {
		dispatch('blur');
	}

	function handleChange (payload) {
		dispatch('change', payload);
	}

	$: handleChange(value);
</script>

<div
	class:required
	class:unset={value === null}
	class:default={value === defaultValue}
>
	{#if isNil(defaultValue)}
		<span>
			<input
				id={id} type='radio'
				bind:group={value}
				value={null}
				on:focus={handleFocus}
				on:blur={handleBlur}
			>
			<label for={id} class='boolean-state'>Unset</label>
		</span>
	{/if}
	{#each typeObject as item}
		<span>
			<input
				id={`${id}-${item}`} type='radio'
				bind:group={value}
				value={item}
				on:focus={handleFocus}
				on:blur={handleBlur}
			>
			<label for={`${id}-${item}`} class='boolean-state'>{item}</label>
		</span>
	{/each}
</div>

<style>
	.required.unset {
		color: red;
	}
	.default {
		background-color: #fff1ff;
	}
	label {
		margin-right: 1em;
	}
	span {
		white-space: nowrap;
	}
</style>
