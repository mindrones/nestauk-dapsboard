<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let value;
	export let list;
	export let active;

	let visible = [];

	function handleItemClick (selection) {
		dispatch('selected', selection.target.innerText)
	}

	$: visible = list.filter(i => i.startsWith(value) && i !== value);
</script>

{#if active && visible.length > 0}
	<ul>
		{#each visible as item}
			<li on:click={handleItemClick}>{item}</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		position: absolute;
		width: 100%;
		margin: 0;
		border: 1px solid black;
		background: white;
		padding: 0;
		list-style-type: none;
	}
	li {
		padding-left: 0.5em;
	}
	li:hover {
		background: #ddd;
	}
</style>
