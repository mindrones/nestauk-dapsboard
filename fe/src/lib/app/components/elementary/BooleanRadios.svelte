<script>
	import {createEventDispatcher} from 'svelte';
	import {isNil} from 'lamb';

	const dispatch = createEventDispatcher();

	export let id = null;
	export let required = false;
	export let value = null;
	export let defaultValue;

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
	<span>
		<input
			id={`${id}-true`} type='radio'
			bind:group={value}
			value={true}
			on:focus={handleFocus}
			on:blur={handleBlur}
		>
		<label for={`${id}-true`} class='boolean-state'>True</label>
	</span>
	<span>
		<input
			id={`${id}-false`} type='radio'
			bind:group={value}
			value={false}
			on:focus={handleFocus}
			on:blur={handleBlur}
		>
		<label for={`${id}-false`} class='boolean-state'>False</label>
	</span>
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
