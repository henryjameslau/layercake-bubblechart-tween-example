<script>
	import { LayerCake, Svg, Html } from 'layercake';

	import Plot from './components/Bubble.svg.svelte';
	import AxisX from './components/AxisX.svelte';
	import AxisY from './components/AxisY.svelte';
	import QuadTree from './components/QuadTree.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	import points from './data/points.csv';

	let xKey = 'Proximity to others';
	let yKey = 'Exposure to disease';
	const rKey = 'Total in employment';

	let data = points.map(function(d){return {"name":d["Occupation title"],x:+d[xKey],y:+d[yKey],r:+d[rKey]}})

	const tweenedPoints = tweened(data,{duration:2000,easing:cubicInOut})

	$: temppoints=points.map(function(d){return {"name":d["Occupation title"],x:+d[xKey],y:+d[yKey],r:+d[rKey]}})

	function setTween(){
		tweenedPoints.set(temppoints)
	}

	$: setTween(xKey)
</script>

<style>
	.chart-container {
		width: 100%;
		height: 50%;
	}

	.circle {
    position: absolute;
		border:3px solid #212121;
    border-radius: 50%;
    background-color: #FFA500;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
	.tooltip{
		position: absolute;
		max-width:100px;
	}
</style>
<h2>xKey</h2>
<select bind:value={xKey}>
		{#each ['Proximity to others','Exposure to disease','Total in employment'] as d}
			<option value={d}>{d}</option>
		{/each}
</select>

<div class="chart-container">
	<LayerCake
		padding={{ top: 20, right: 20, bottom: 20, left: 25 }}
		x='x'
		y='y'
		r='r'
		yDomain={[0,100]}
		xDomain={[0,null]}
		data={$tweenedPoints}
	>
		<Svg>
			<AxisX/>
			<AxisY/>
			<Plot/>
		</Svg>
		<Html>
				<QuadTree
					let:x
					let:y
					let:visible
					let:found
					let:r
				>
					<div
					class="circle"
					style="top:{y}px;left:{x}px;height:{2*r}px;width:{2*r}px;display:{visible?'block':'none'};"
					></div>
					<div class="tooltip"
					style="top:{y}px;left:{x}px;display:{visible?'block':'none'};"
					>{found["name"]}
					</div>

				</QuadTree>
		</Html>
	</LayerCake>
</div>
