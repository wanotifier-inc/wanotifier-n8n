import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WaNotifierApi implements ICredentialType {
	name = 'waNotifierApi';

	displayName = 'WANotifier API';

	icon: Icon = {
		light: 'file:../nodes/WaNotifier/wanotifier.svg',
		dark: 'file:../nodes/WaNotifier/wanotifier.dark.svg',
	};

	documentationUrl = 'https://help.wanotifier.com/en/article/wanotifier-api/';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your WANotifier API key. Generate one in WANotifier → Integrations → API Integration → API Keys.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				key: '={{ $credentials.apiKey }}',
			},
			headers: {
				'X-API-KEY': '={{ $credentials.apiKey }}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.wanotifier.com/api/v1',
			url: '/verify_api',
			method: 'POST',
			body: {
				source: 'n8n',
			},
		},
	};
}
