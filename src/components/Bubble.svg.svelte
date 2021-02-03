<script>
	import { getContext } from 'svelte';

	const { data, xGet, yGet, rGet, xScale, yScale,rScale } = getContext('LayerCake');

	export let fill = '#ccc';
	export let opacity = 0.6;
	export let stroke = '#b4b4b4';
	export let strokeWidth = 1;

</script>

<g class="scatter-group">
	{#each $data as d}
		<circle
			cx={$xGet(d)}
			cy={$yGet(d)}
			r={$rGet(d)}
			{fill}
			{stroke}
			{opacity}
			stroke-width={strokeWidth}
		/>
	{/each}
</g>
