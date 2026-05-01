import type { INodeProperties } from 'n8n-workflow';

export const messageTemplateProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['messageTemplate'] } },
		options: [
			{
				name: 'Send Message Template',
				value: 'send',
				description:
					'Send a templated WhatsApp message via a pre-configured transactional notification',
				action: 'Send a message template',
			},
		],
		default: 'send',
	},

	{
		displayName: 'Recipient WhatsApp Number',
		name: 'whatsappNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '+919876543210',
		description: 'Recipient number with country code. E.g. +919876543210',
		displayOptions: { show: { resource: ['messageTemplate'], operation: ['send'] } },
	},
	{
		displayName: 'Recipient First Name',
		name: 'firstName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['messageTemplate'], operation: ['send'] } },
	},
	{
		displayName: 'Recipient Last Name',
		name: 'lastName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['messageTemplate'], operation: ['send'] } },
	},
	{
		displayName: 'Notification Name or ID',
		name: 'notificationKey',
		type: 'options',
		required: true,
		typeOptions: { loadOptionsMethod: 'getNotifications' },
		default: '',
		description:
			'The transactional notification to fire. Create one in WANotifier → Notifications → Add New (type: Transaction / Integration / API; trigger: API request to a Webhook URL). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: { resource: ['messageTemplate'], operation: ['send'] } },
	},
	{
		displayName: 'Template Variables',
		name: 'templateVariables',
		type: 'resourceMapper',
		default: { mappingMode: 'defineBelow', value: null },
		noDataExpression: true,
		required: true,
		typeOptions: {
			loadOptionsDependsOn: ['notificationKey'],
			resourceMapper: {
				resourceMapperMethod: 'getNotificationVariables',
				mode: 'add',
				fieldWords: { singular: 'variable', plural: 'variables' },
				addAllFields: true,
				multiKeyMatch: false,
				supportAutoMap: false,
			},
		},
		displayOptions: { show: { resource: ['messageTemplate'], operation: ['send'] } },
	},
];
