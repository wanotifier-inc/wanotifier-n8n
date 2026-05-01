import type { INodeProperties } from 'n8n-workflow';

const recipientFields = (operations: string[]): INodeProperties[] => [
	{
		displayName: 'Recipient WhatsApp Number',
		name: 'whatsappNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '+919876543210',
		description: 'Recipient number with country code. E.g. +919876543210',
		displayOptions: { show: { resource: ['message'], operation: operations } },
	},
	{
		displayName: 'Recipient First Name',
		name: 'firstName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['message'], operation: operations } },
	},
	{
		displayName: 'Recipient Last Name',
		name: 'lastName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['message'], operation: operations } },
	},
];

export const messageProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['message'] } },
		options: [
			{
				name: 'Send Text Message',
				value: 'sendText',
				description: 'Send a plain text WhatsApp message',
				action: 'Send a text message',
			},
			{
				name: 'Send Media Message',
				value: 'sendMedia',
				description: 'Send an image, video, document, audio, or sticker',
				action: 'Send a media message',
			},
			{
				name: 'Send Location',
				value: 'sendLocation',
				description: 'Send a location pin',
				action: 'Send a location',
			},
			{
				name: 'Send Interactive Message',
				value: 'sendInteractive',
				description: 'Send a message with up to 3 reply buttons',
				action: 'Send an interactive message',
			},
		],
		default: 'sendText',
	},

	...recipientFields(['sendText', 'sendMedia', 'sendLocation', 'sendInteractive']),

	// ─── Send Text ─────────────────────────────────────────────
	{
		displayName: 'Message Body',
		name: 'body',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { rows: 4 },
		description: 'The text of the message to send',
		displayOptions: { show: { resource: ['message'], operation: ['sendText'] } },
	},

	// ─── Send Media ────────────────────────────────────────────
	{
		displayName: 'Media Type',
		name: 'mediaType',
		type: 'options',
		required: true,
		default: 'image',
		options: [
			{ name: 'Audio', value: 'audio' },
			{ name: 'Document', value: 'document' },
			{ name: 'Image', value: 'image' },
			{ name: 'Sticker', value: 'sticker' },
			{ name: 'Video', value: 'video' },
		],
		displayOptions: { show: { resource: ['message'], operation: ['sendMedia'] } },
	},
	{
		displayName: 'Image URL',
		name: 'link',
		type: 'string',
		required: true,
		default: '',
		description:
			'Public URL to a JPEG or PNG image (max 5 MB). Google Drive and dynamic links are not supported.',
		displayOptions: {
			show: { resource: ['message'], operation: ['sendMedia'], mediaType: ['image'] },
		},
	},
	{
		displayName: 'Video URL',
		name: 'link',
		type: 'string',
		required: true,
		default: '',
		description: 'Public URL to an MP4 or 3GP video (max 15 MB)',
		displayOptions: {
			show: { resource: ['message'], operation: ['sendMedia'], mediaType: ['video'] },
		},
	},
	{
		displayName: 'Document URL',
		name: 'link',
		type: 'string',
		required: true,
		default: '',
		description: 'Public URL to a TXT, XLS, XLSX, DOC, DOCX, PPT, PPTX, or PDF (max 100 MB)',
		displayOptions: {
			show: { resource: ['message'], operation: ['sendMedia'], mediaType: ['document'] },
		},
	},
	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		default: '',
		description: 'Filename shown to the recipient (e.g. invoice.pdf)',
		displayOptions: {
			show: { resource: ['message'], operation: ['sendMedia'], mediaType: ['document'] },
		},
	},
	{
		displayName: 'Audio URL',
		name: 'link',
		type: 'string',
		required: true,
		default: '',
		description: 'Public URL to AAC, AMR, MP3, M4A, or OGG audio (max 16 MB)',
		displayOptions: {
			show: { resource: ['message'], operation: ['sendMedia'], mediaType: ['audio'] },
		},
	},
	{
		displayName: 'Sticker URL',
		name: 'link',
		type: 'string',
		required: true,
		default: '',
		description: 'Public URL to a WEBP sticker (max 500 KB animated, 100 KB static)',
		displayOptions: {
			show: { resource: ['message'], operation: ['sendMedia'], mediaType: ['sticker'] },
		},
	},
	{
		displayName: 'Caption',
		name: 'caption',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['sendMedia'],
				mediaType: ['image', 'video', 'document'],
			},
		},
	},

	// ─── Send Location ─────────────────────────────────────────
	{
		displayName: 'Location Latitude',
		name: 'latitude',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: { numberPrecision: 6 },
		displayOptions: { show: { resource: ['message'], operation: ['sendLocation'] } },
	},
	{
		displayName: 'Location Longitude',
		name: 'longitude',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: { numberPrecision: 6 },
		displayOptions: { show: { resource: ['message'], operation: ['sendLocation'] } },
	},
	{
		displayName: 'Location Name',
		name: 'placeName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['message'], operation: ['sendLocation'] } },
	},
	{
		displayName: 'Location Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['message'], operation: ['sendLocation'] } },
	},

	// ─── Send Interactive ──────────────────────────────────────
	{
		displayName: 'Message Body',
		name: 'body',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { rows: 3 },
		description: 'The main question or prompt shown above the reply buttons',
		displayOptions: { show: { resource: ['message'], operation: ['sendInteractive'] } },
	},
	{
		displayName: 'Button 1 Text',
		name: 'button1Title',
		type: 'string',
		required: true,
		default: '',
		description: 'Max 20 characters',
		displayOptions: { show: { resource: ['message'], operation: ['sendInteractive'] } },
	},
	{
		displayName: 'Button 2 Text',
		name: 'button2Title',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['message'], operation: ['sendInteractive'] } },
	},
	{
		displayName: 'Button 3 Text',
		name: 'button3Title',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['message'], operation: ['sendInteractive'] } },
	},
];
