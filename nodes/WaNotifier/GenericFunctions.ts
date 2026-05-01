import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	ResourceMapperFields,
	ResourceMapperField,
} from 'n8n-workflow';

const BASE_URL = 'https://app.wanotifier.com/api/v1';

/**
 * Centralized HTTP wrapper using the built-in helper (no runtime deps).
 * Auth (key qs + X-API-KEY header) is injected by the credential's
 * `authenticate.generic` block, so we only build the per-call shape here.
 */
export async function waRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined = undefined,
	qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${endpoint}`,
		json: true,
		headers: {
			Accept: 'application/json',
		},
		qs,
	};

	if (body !== undefined) {
		options.body = body;
	}

	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'waNotifierApi',
		options,
	)) as IDataObject | IDataObject[];
}

const titleCase = (s: string) =>
	s
		.split('_')
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');

const parseRequiredSuffix = (label: string): { label: string; required: boolean } => {
	const stripped = stripHtml(label).trim();
	const requiredMatch = /\s*\(required\)\s*$/i.exec(stripped);
	if (requiredMatch) {
		return { label: stripped.slice(0, requiredMatch.index).trim(), required: true };
	}
	const optionalMatch = /\s*\(optional\)\s*$/i.exec(stripped);
	if (optionalMatch) {
		return { label: stripped.slice(0, optionalMatch.index).trim(), required: false };
	}
	return { label: stripped, required: false };
};

// loadOptions: tags
export async function loadTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = (await waRequest.call(this, 'GET', '/contacts/tags')) as IDataObject[];
	return (items ?? []).map((t) => ({
		name: String(t.name ?? t.id),
		value: Number(t.id),
	}));
}

// loadOptions: lists
export async function loadLists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = (await waRequest.call(this, 'GET', '/contacts/lists')) as IDataObject[];
	return (items ?? []).map((l) => ({
		name: String(l.name ?? l.id),
		value: Number(l.id),
	}));
}

// loadOptions: notifications (returns webhook_key as the value)
export async function loadNotifications(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const res = (await waRequest.call(this, 'GET', '/notifications')) as IDataObject;
	const list = (res?.notifications as IDataObject[]) ?? [];
	return list.map((n) => ({
		name: String(n.title ?? n.webhook_key),
		value: String(n.webhook_key),
	}));
}

// loadOptions: contact attributes
export async function loadContactAttributes(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const res = (await waRequest.call(this, 'GET', '/contacts/attributes')) as
		| string[]
		| IDataObject[];
	if (!Array.isArray(res)) return [];
	return res.map((entry) => {
		const key = typeof entry === 'string' ? entry : String((entry as IDataObject).key ?? '');
		return { name: titleCase(key), value: key };
	});
}

// resourceMapping: notification template variables
export async function loadNotificationVariables(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {
	const notificationKey = this.getCurrentNodeParameter('notificationKey') as string | undefined;
	if (!notificationKey) {
		return { fields: [] };
	}

	let variables: Array<{ key: string; label?: string }> = [];
	try {
		const res = (await waRequest.call(
			this,
			'GET',
			`/notifications/${encodeURIComponent(notificationKey)}/variables`,
		)) as IDataObject | IDataObject[];

		if (Array.isArray(res)) {
			variables = res as Array<{ key: string; label?: string }>;
		} else if (res && typeof res === 'object') {
			const data = ((res.variables as IDataObject)?.data ?? {}) as IDataObject;
			variables = Object.entries(data).map(([key, label]) => ({ key, label: String(label) }));
		}
	} catch {
		return { fields: [] };
	}

	const fields: ResourceMapperField[] = variables.map(({ key, label }) => {
		const { label: cleanLabel } = parseRequiredSuffix(label ?? key);
		return {
			id: key,
			displayName: cleanLabel || titleCase(key),
			required: true,
			defaultMatch: false,
			display: true,
			type: 'string',
			canBeUsedToMatch: false,
		};
	});

	return { fields };
}
