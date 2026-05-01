import type { INodeProperties } from 'n8n-workflow';

export const contactProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contact'] } },
		options: [
			{
				name: 'Create or Update',
				value: 'upsert',
				description: 'Create a new record, or update the current one if it already exists (upsert)',
				action: 'Create or update a contact',
			},
		],
		default: 'upsert',
	},

	{
		displayName: 'WhatsApp Number',
		name: 'whatsappNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '+919876543210',
		description: 'Enter WhatsApp number with country code. E.g. +919876543210',
		displayOptions: { show: { resource: ['contact'], operation: ['upsert'] } },
	},
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['contact'], operation: ['upsert'] } },
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['contact'], operation: ['upsert'] } },
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'Subscribed', value: 'subscribed' },
			{ name: 'Unsubscribed', value: 'unsubscribed' },
		],
		default: 'subscribed',
		description:
			'When Subscribed, broadcast notifications are sent to this contact. When Unsubscribed, the contact is skipped.',
		displayOptions: { show: { resource: ['contact'], operation: ['upsert'] } },
	},
	{
		displayName: 'Tag Names or IDs',
		name: 'tagIds',
		type: 'multiOptions',
		typeOptions: { loadOptionsMethod: 'getTags' },
		default: [],
		description:
			'Tags to assign to the contact. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: { resource: ['contact'], operation: ['upsert'] } },
	},
	{
		displayName: 'List Names or IDs',
		name: 'listIds',
		type: 'multiOptions',
		typeOptions: { loadOptionsMethod: 'getLists' },
		default: [],
		description:
			'Lists to add the contact to. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: { resource: ['contact'], operation: ['upsert'] } },
	},
	{
		displayName: 'Replace Tags & Lists',
		name: 'replace',
		type: 'options',
		required: true,
		default: 'yes',
		options: [
			{ name: 'Yes', value: 'yes' },
			{ name: 'No', value: 'no' },
		],
		description:
			'Yes: the tags and lists selected above replace whatever is currently on the contact. No: they are added on top of the contact\'s existing tags and lists.',
		displayOptions: { show: { resource: ['contact'], operation: ['upsert'] } },
	},
	{
		displayName: 'Custom Attributes',
		name: 'attributes',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Attribute',
		displayOptions: { show: { resource: ['contact'], operation: ['upsert'] } },
		options: [
			{
				name: 'attribute',
				displayName: 'Attribute',
				values: [
					{
						displayName: 'Name or ID',
						name: 'key',
						type: 'options',
						typeOptions: { loadOptionsMethod: 'getContactAttributes' },
						default: '',
						description:
							'Choose an attribute. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
];
