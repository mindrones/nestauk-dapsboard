<script>
	import { createEventDispatcher } from 'svelte';

	import {Icon, HelpCircle} from '@svizzle/ui';
	import {is_boolean, is_enums} from '$lib/types/index.js';
	import { getEditor } from '$lib/app/components/elementary/TypedField.utils.js';
	import { autoID } from '$lib/utils/ids.js';

	const dispatch = createEventDispatcher();

	const id = autoID();

	export let dataType;
	export let help = true;
	export let labelText = '';
	export let required;
	export let typeObject;
	export let value = null;

	let editor;
	let defaultValue;

	function displayDocs () {
		dispatch('docs', 'display');
	}

	function hideDocs () {
		dispatch('docs', 'hide');
	}

	function setDocs () {
		dispatch('docs', 'set');
	}

	function unsetDocs () {
		dispatch('docs', 'unset');
	}

	function handleChange (event) {
		dispatch('change', event.detail);
	}

	$: {
		editor = getEditor(typeObject);
		defaultValue = typeObject?.__default;
	}
</script>

<label
	for={id}
	on:mouseover={displayDocs}
	on:mouseout={hideDocs}
	title={dataType}
	class:inline={!help && (is_enums(typeObject) || is_boolean(typeObject))}
>
	{labelText.startsWith('_') ? '' : labelText}
	{#if help}
		<Icon
			glyph={HelpCircle}
			size={14}
		/>
	{/if}
</label>
<div
	on:mouseover={displayDocs}
	on:mouseout={hideDocs}
>
	{#if editor}
		<svelte:component
			this={editor.component}
			{value}
			{id}
			{defaultValue}
			{required}
			on:change={handleChange}
			on:focus={setDocs}
			on:blur={unsetDocs}
			{...editor.props}
		/>
	{/if}
</div>

<style>
	label {
		white-space: nowrap;
		justify-self: end;
	}
	.inline {
		float: left;
		margin-right: 1em;
		font-weight: bold;
		width: 25%;
		min-width: min-content;
	}
</style>
