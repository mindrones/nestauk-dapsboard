<script context='module'>
	export const tabsKey = {};
</script>

<script>
	import { createEventDispatcher, setContext, onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const dispatch = createEventDispatcher();

	export let className;
	const tabs = writable([]);
	export const selectedTab = writable(null);

	setContext(tabsKey, {
		tabs,
		selectedTab,
	});

	onMount(() => {
		if ($tabs.length > 0) {
			[$selectedTab] = $tabs;
		}
	});

	$: dispatch('change', $selectedTab);
</script>

<div class={`tab-control ${className}`}>
	<div class='tabs'>
		<slot isTitleSlot={true} isContentSlot={false} />
	</div>
	<div class='tab-content'>
		<slot isTitleSlot={false} isContentSlot={true} />
	</div>
</div>

<style>
	.tab-control {
		display: grid;
		grid-template-rows: min-content auto min-content;
		overflow: hidden;
		box-sizing: border-box;
		height: 100%;
		position: relative;
		min-width: 12em;
	}
	.tab-content {
		display: grid;
		grid-template-rows: auto min-content;
		padding: 1em;
	}
	.tabs {
		display: grid;
		grid-auto-flow: column;
	}
</style>
