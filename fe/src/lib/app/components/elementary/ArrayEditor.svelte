<script>
	import {createEventDispatcher} from 'svelte';
	import {isNil} from 'lamb';
	import {isObject} from '@svizzle/utils';

	const dispatch = createEventDispatcher();

	export let currentValue;
	export let fieldEditor;
	export let newItemValue = null
	export let value = [];

	const isEmpty = target =>
		isNil(target)
		|| target === ''
		|| isObject(target)
			&& Object.keys(target).every(key => isEmpty(target[key]))
		|| false;

	function add () {
		if (!currentValue) {
			currentValue = [];
		}
		if (currentValue.length === 0 || !isEmpty(currentValue[currentValue.length - 1])) {
			currentValue = [...currentValue, newItemValue];
			newItemValue = null;
			dispatch('change', currentValue);
		}
	}
	function set (id, newValue) {
		currentValue[id] = newValue;
		dispatch('change', currentValue);
	}
	function discard (id) {
		currentValue.splice(id, 1);
		currentValue = currentValue;
		dispatch('change', currentValue);
	}

	$: currentValue = value;
</script>

<div class:largeItems={fieldEditor.component.name === 'ObjectEditor'}>
	{#if value}
		{#each value as item, id (item)}
			<span>
				<svelte:component
					this={fieldEditor.component}
					value={item}
					{...fieldEditor.props}
					on:change={e => {
						const val = e.detail;
						if (isEmpty(val))	{
							discard(id);
						} else {
							set(id, val);
						}
					}}
				/>
			</span>
			<button on:click={() => discard(id)}>-</button>
		{/each}
	{/if}
	<span class='add'>
		<button on:click={() => add()}>+</button>
	</span>
</div>

<style>
	div {
		display: grid;
		grid-template-columns: 1fr min-content;
	}
	div.largeItems {
		grid-template-columns: 1fr;
		border-left: 1px solid lightgray;
	}
	span {
		display: inline-block;
		position: relative;
	}
	button {
		width: 4.8em;
		height: 1.6em;
		font-weight: bold;
		cursor: pointer;
		background: #cef;
		align-self: center;
	}
	.largeItems button {
		border-color: rgb(118,118,118);
	}
	.largeItems .add {
		border-left: 1px solid black;
	}
</style>
