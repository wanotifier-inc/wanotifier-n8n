import {
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import { contactProperties } from './ContactDescription';
import { messageProperties } from './MessageDescription';
import { messageTemplateProperties } from './MessageTemplateDescription';
import {
	loadContactAttributes,
	loadLists,
	loadNotificationVariables,
	loadNotifications,
	loadTags,
	waRequest,
} from './GenericFunctions';

const slugify = (s: string) =>
	String(s)
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '')
		.slice(0, 256) || 'button';

interface AttributeEntry {
	key?: string;
	value?: string;
}

interface MappedTemplateVariables {
	mappingMode?: string;
	value?: IDataObject | null;
}

export class WaNotifier implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WANotifier',
		name: 'waNotifier',
		icon: { light: 'file:wanotifier.svg', dark: 'file:wanotifier.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create or update WANotifier contacts and send WhatsApp messages',
		defaults: { name: 'WANotifier' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'waNotifierApi', required: true }],
		requestDefaults: {
			baseURL: 'https://app.wanotifier.com/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Contact', value: 'contact' },
					{ name: 'Message', value: 'message' },
					{ name: 'Message Template', value: 'messageTemplate' },
				],
				default: 'contact',
			},
			...contactProperties,
			...messageProperties,
			...messageTemplateProperties,
		],
	};

	methods = {
		loadOptions: {
			getTags: loadTags,
			getLists: loadLists,
			getNotifications: loadNotifications,
			getContactAttributes: loadContactAttributes,
		},
		resourceMapping: {
			getNotificationVariables: loadNotificationVariables,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let response: IDataObject | IDataObject[] = {};

				if (resource === 'contact' && operation === 'upsert') {
					const replaceParam = this.getNodeParameter('replace', i, 'yes') as string;
					const body: IDataObject = {
						whatsapp_number: this.getNodeParameter('whatsappNumber', i) as string,
						replace: replaceParam === 'yes',
					};
					const firstName = this.getNodeParameter('firstName', i, '') as string;
					const lastName = this.getNodeParameter('lastName', i, '') as string;
					const status = this.getNodeParameter('status', i, '') as string;
					const tagIds = this.getNodeParameter('tagIds', i, []) as Array<number | string>;
					const listIds = this.getNodeParameter('listIds', i, []) as Array<number | string>;
					const attributesParam = this.getNodeParameter('attributes', i, {}) as {
						attribute?: AttributeEntry[];
					};

					if (firstName) body.first_name = firstName;
					if (lastName) body.last_name = lastName;
					if (status) body.status = status;
					if (tagIds.length) body.tag_ids = tagIds.map((v) => Number(v));
					if (listIds.length) body.list_ids = listIds.map((v) => Number(v));

					const attrs: IDataObject = {};
					for (const entry of attributesParam.attribute ?? []) {
						if (entry?.key && entry.value !== undefined && entry.value !== '') {
							attrs[entry.key] = entry.value;
						}
					}
					if (Object.keys(attrs).length) body.attributes = attrs;

					response = (await waRequest.call(this, 'POST', '/contacts', body)) as IDataObject;
				} else if (resource === 'message') {
					const recipient: IDataObject = {
						whatsapp_number: this.getNodeParameter('whatsappNumber', i) as string,
					};
					const firstName = this.getNodeParameter('firstName', i, '') as string;
					const lastName = this.getNodeParameter('lastName', i, '') as string;
					if (firstName) recipient.first_name = firstName;
					if (lastName) recipient.last_name = lastName;

					let message: IDataObject;

					if (operation === 'sendText') {
						message = {
							type: 'text',
							text: {
								preview_url: true,
								body: this.getNodeParameter('body', i) as string,
							},
						};
					} else if (operation === 'sendMedia') {
						const mediaType = this.getNodeParameter('mediaType', i) as string;
						const link = this.getNodeParameter('link', i) as string;
						const payload: IDataObject = { link };
						if (['image', 'video', 'document'].includes(mediaType)) {
							const caption = this.getNodeParameter('caption', i, '') as string;
							if (caption) payload.caption = caption;
						}
						if (mediaType === 'document') {
							const filename = this.getNodeParameter('filename', i, '') as string;
							if (filename) payload.filename = filename;
						}
						message = { type: mediaType, [mediaType]: payload };
					} else if (operation === 'sendLocation') {
						message = {
							type: 'location',
							location: {
								latitude: Number(this.getNodeParameter('latitude', i)),
								longitude: Number(this.getNodeParameter('longitude', i)),
								name: this.getNodeParameter('placeName', i) as string,
								address: this.getNodeParameter('address', i) as string,
							},
						};
					} else if (operation === 'sendInteractive') {
						const titles = [
							this.getNodeParameter('button1Title', i, '') as string,
							this.getNodeParameter('button2Title', i, '') as string,
							this.getNodeParameter('button3Title', i, '') as string,
						]
							.map((t) => (t ?? '').trim())
							.filter((t) => t.length > 0);

						message = {
							type: 'interactive',
							interactive: {
								type: 'button',
								body: { text: this.getNodeParameter('body', i) as string },
								action: {
									buttons: titles.map((title) => ({
										type: 'reply',
										reply: { id: slugify(title), title },
									})),
								},
							},
						};
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported message operation: ${operation}`,
							{ itemIndex: i },
						);
					}

					response = (await waRequest.call(this, 'POST', '/messages', {
						recipient,
						message,
					})) as IDataObject;
				} else if (resource === 'messageTemplate' && operation === 'send') {
					const notificationKey = this.getNodeParameter('notificationKey', i) as string;
					const recipient: IDataObject = {
						whatsapp_number: this.getNodeParameter('whatsappNumber', i) as string,
					};
					const firstName = this.getNodeParameter('firstName', i, '') as string;
					const lastName = this.getNodeParameter('lastName', i, '') as string;
					if (firstName) recipient.first_name = firstName;
					if (lastName) recipient.last_name = lastName;

					const mapping = this.getNodeParameter('templateVariables', i, {}) as
						| MappedTemplateVariables
						| undefined;
					const mapped = (mapping?.value ?? {}) as IDataObject;

					const ARRAY_GROUPS = ['body_variables', 'button_variables'];
					const data: IDataObject = {};
					const groups: Record<string, Array<{ idx: number; value: unknown }>> = {};

					for (const [k, v] of Object.entries(mapped)) {
						if (v === '' || v === null || v === undefined) continue;
						const group = ARRAY_GROUPS.find((g) => new RegExp(`^${g}_(\\d+)$`).test(k));
						if (group) {
							const idx = Number(k.slice(group.length + 1));
							(groups[group] ??= []).push({ idx, value: v });
						} else {
							data[k] = v as IDataObject[keyof IDataObject];
						}
					}
					for (const [name, entries] of Object.entries(groups)) {
						entries.sort((a, b) => a.idx - b.idx);
						data[name] = entries.map((e) => e.value);
					}

					response = (await waRequest.call(
						this,
						'POST',
						`/notifications/${encodeURIComponent(notificationKey)}`,
						{ data, recipients: [recipient] },
					)) as IDataObject;
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported resource/operation: ${resource}/${operation}`,
						{ itemIndex: i },
					);
				}

				const responseArray = Array.isArray(response) ? response : [response];
				returnData.push(
					...responseArray.map((json) => ({ json, pairedItem: { item: i } })),
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
