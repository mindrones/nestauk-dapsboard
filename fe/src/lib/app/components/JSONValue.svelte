<script>
	import { createEventDispatcher } from 'svelte';
	import { keys } from 'lamb';

	const dispatch = createEventDispatcher();

	export let value;
	export let editable = false;
	export let parsedValue = null;
	export let highlighted = true;
	export let isErrorValue = false;

	let json = '';

	function generateHTML (input) {
		const nodeType = typeof input;
		let html;

		switch (nodeType) {
			case 'boolean':
			case 'number':
				html = input.toString();
				break;
			case 'string':
				html = `"${input}"`;
				break;
			case 'object': {
				if (input === null) {
					html = 'null';
				} else if (Array.isArray(input)) {
					let propsHtml = input.map((v, i) => `<li><span class='property-value'>${generateHTML(v)}</span>${i < input.length - 1 ? "<span class='boilerplate'>,</span>" : ""}</li>`);

					html = `<span class='boilerplate'>[</span> <ul class='property-list'>${propsHtml.join('')}</ul><span class='boilerplate'>]</span>`;
				} else {
					let propsHtml = keys(input).map((k, i) =>
						`<li><span class='property-name'>"${k}"</span> <span class='boilerplate'>:</span> <span class='property-value'>${generateHTML(input[k])}</span>${i < keys.length - 1 ? "<span class='boilerplate'>,</span>" : ""}</li>`
					);

					html = `<span class='boilerplate'>{</span> <ul class='property-list'>${propsHtml.join('')}</ul><span class='boilerplate'>}</span>`;
				}
				break;
			}
			default:
				html = '';
		}

		return html;
	}

	function handleInput (event) {
		try {
			const text = event.target.textContent;
			if (editable && text !== '') {
				parsedValue = JSON.parse(text);
			} else {
				parsedValue = null;
			}
			dispatch('change', parsedValue);
		} catch (error) {
			parsedValue = null;
			console.log(error);
		}
	}

	$: json = highlighted
		? generateHTML(parsedValue = value)
		: JSON.stringify(parsedValue = value, null, 2);
</script>

{#if editable === true}
	<pre class:error={isErrorValue} contenteditable on:input={handleInput}>{@html json}</pre>
{:else}
	<pre class:error={isErrorValue}>{@html json}</pre>
{/if}

<style>
pre {
	overflow: auto;
	width: 100%;
	height: 100%;
	font-family: monospace;
}
pre.error {
	background-color: #fee;
}
:global(.boilerplate) {
	color: #fC8;
}
:global(.property-list) {
	margin-left: 1em;
	list-style-type: none;
}
:global(.property-name) {
	font-weight: bold;
	color: #000;
}
:global(.property-value) {
	color: #00F;
}
</style>
