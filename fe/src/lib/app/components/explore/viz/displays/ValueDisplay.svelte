<script>
	export let label;
	export let value;
</script>

<div>
	{#if label}
		<div class='label'>{label}</div>
	{/if}
	<div class='value'>{value}</div>
</div>

<style>
	.label {
		font-weight: bold;
	}
	.value {
		font-weight: bold;
		font-size: 1.5rem;
	}
</style>
