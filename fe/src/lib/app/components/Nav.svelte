<script>
	import {Icon, Link, Lock, Unlock} from '@svizzle/ui';

	import {
		_isAuthenticated,
		_isAuthModalOpen
	} from '$lib/app/stores/auth.js';
	import {version} from '$lib/app/utils/version.js';

	const changelogUrl = 'https://github.com/nestauk/dapsboard/blob/dev/CHANGELOG.md';

	export let segment;

	const onAuthClick = () => {
		$_isAuthModalOpen = true;
	};

	$: authIcon = $_isAuthenticated ? Unlock : Lock;
</script>

<nav>
	<div>
		<ul>
			<li class:selected={segment === undefined}>
				<a href='/'><span class='bold'>Home</span></a>
			</li>
			<!-- <li class:selected='{segment === "datasets"}'>
				<a
					rel=prefetch
					href='/datasets'
				><span class='bold'>Datasets</span></a>
			</li> -->
			<li class:selected={segment === "builder"}>
				<a
					rel='prefetch'
					href='/builder'
				><span class='bold'>Inspect</span></a>
			</li>
			<li class:selected={segment === "explore"}>
				<a
					rel='prefetch'
					href='/explore'
				><span class='bold'>Explore</span></a>
			</li>
		</ul>
	</div>
	<div>
		<ul>
			<!-- for later -->
			<!-- <li class:selected='{segment === "feedback"}'>
				<a href='/feedback'>Feedback</a>
			</li> -->
			<li>
				<button on:click={onAuthClick}>
					<Icon
						glyph={authIcon}
						stroke='white'
					/>
				</button>
			</li>
			<li>
				<Link
					href={changelogUrl}
					type='external'
				>
					{version}
				</Link>
			</li>
		</ul>
	</div>
</nav>

<style>
	nav {
		width: 100%;
		height: 100%;
		font-weight: 300;
		font-family: 'Open Sans Regular', sans-serif;

		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	div, ul, li, a {
		height: 100%;
	}

	ul {
		margin: 0;
		padding: 0;
		display: flex;
		align-items: center;
	}

	li {
		display: block;
		float: left;
		margin-right: 0.5rem;
		padding: 1em 0.5em;
	}

	.selected {
		position: relative;
		display: inline-block;
		font-weight: bold;
		color: var(--color-selected);
	}

	.selected::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: var(--color-selected);
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		display: block;
		user-select: none;
	}

	button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}
</style>
