<script>
	import {Link} from '@svizzle/ui';
	import Select from '$lib/app/components/elementary/Select.svelte';
	import aggsDocURL from '$lib/elasticsearch/config/aggsDocURL.js';

	export let title = '';
	export let selectedOption = null;
	export let hideDisabled = false;
	export let options = [];
	export let setAggDocs = null;

	export let selectionChangedHandler;
</script>

<header class='semibold'>{title}</header>
<Select
	{selectedOption}
	{hideDisabled}
	{options}
	on:selectionChanged={selectionChangedHandler}
	let:option={option}
>
	<div
		class='select-item'
		on:mouseover={() => setAggDocs?.(option.value)}
		on:mouseout={() => setAggDocs?.(null)}
	>
		<div>{option.text}</div>
		<Link
			href={aggsDocURL[option.value]}
			size={14}
			type='external'
		/>
	</div>
</Select>

<style>
	header {
		font-size: 1em;
		margin: .5em 0;
	}
	.select-item {
		display: grid;
		grid-template-columns: 1fr min-content;
		grid-column-gap: 1em;
	}
</style>
