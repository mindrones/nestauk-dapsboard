<script>
	import {_screen, Banner} from '@svizzle/ui';
	import emailRegex from 'email-regex';
	// FIXME Consider RFC 5322 compliant email validation

	import InputWidget from '$lib/app/components/svizzle/InputWidget.svelte';
	import {
		_credentials,
		_isAuthenticated
	} from '$lib/app/stores/auth.js';
	import {
		requestNestaToken,
		verifyNestaToken
	} from '$lib/app/utils/net.js';

	let email;
	let message;

	const validEmailRegex = emailRegex({exact: true});
	const validateEmailFormat = email => validEmailRegex.test(email);
	const validateTokenFormat = token => token.match(/^[0-9a-f]{32}$/ui);

	const validatePastedToken = async token => {
		const isValidToken = validateTokenFormat(token);
		const result = isValidToken && await verifyNestaToken(email, token);
		return result;
	}

	const onEmailSubmitted = async ({detail: email}) => {
		const result = await requestNestaToken(email);

		if (result.error) {
			message = result.error;
		} else {
			message = 'Token sent to your email. Paste it above to authenticate.';
		}
	};

	const onTokenSubmitted = ({detail: token}) => {
		$_isAuthenticated = true;
		$_credentials = {email, token};
		message = 'Authenticated. You can now query the backend.';
	};
</script>

<Banner
	on:close
	{_screen}
>
	<div class='content'>
		<h1>Authenticate</h1>
		<p>
			You need to authenticate with your Nesta email. Please request a
			token and paste it below once retrieved from your mailbox.
		</p>
		<div class='form'>
			<InputWidget
				autofocus={true}
				bind:value={email}
				buttonText='Request'
				on:valueSubmitted={onEmailSubmitted}
				placeholder='Please input your email address'
				validateValue={validateEmailFormat}
			/>
			<InputWidget
				buttonText='Authenticate'
				on:valueSubmitted={onTokenSubmitted}
				placeholder='Please paste your token here'
				validateValue={validatePastedToken}
			/>
		</div>
		{#if message}
			<div class='messages'>
				{message}
			</div>
		{/if}
	</div>
</Banner>

<style>
	.content {
		margin: 1rem;
		max-width: 100%;
	}
	.form {
		margin: 1rem;
		display: grid;
		grid-auto-flow: row;
		grid-gap: 1rem;
	}

	.messages {
		background: rgb(204, 241, 255);
		border: thin solid rgb(0, 153, 255);
		margin: 1rem;
		padding: 1rem;
		border-radius: 0.5rem;
	}
</style>
