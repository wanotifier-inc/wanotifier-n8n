# n8n-nodes-wanotifier

This is an n8n community node. It lets you connect [WANotifier](https://wanotifier.com) — a WhatsApp marketing and automation platform built on the official WhatsApp Business API — to your n8n workflows.

Use it to keep your contact list in sync with other tools, send free-form WhatsApp messages during an active 24-hour conversation window, and fire pre-configured transactional WhatsApp message templates from any workflow trigger.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/). On a self-hosted n8n instance, go to **Settings → Community Nodes → Install** and enter:

```
n8n-nodes-wanotifier
```

## Credentials

You'll need a WANotifier account and an API key.

1. Sign up at [wanotifier.com](https://wanotifier.com).
2. Open **Integrations → API Integration → API Keys** and copy your default key (or click **Add New Key** to create a dedicated key for n8n).
3. In n8n, when you add the WANotifier node, click the credentials field and create a new **WANotifier API** credential. Paste the API key and save. n8n will verify the key against WANotifier's `/verify_api` endpoint.

## Operations

The node exposes three resources, each with one or more operations.

### Contact

- **Create or Update** — create a contact or update an existing one (matched by WhatsApp number). Optionally set first/last name, subscription status, tags, lists, and custom attributes. Tags, lists, and attributes are loaded as dropdowns from your WANotifier account.

### Message *(send during an active 24-hour conversation window)*

- **Send Text Message** — plain text body.
- **Send Media Message** — image, video, document, audio, or sticker via public URL. Document supports filename. Image/video/document support an optional caption.
- **Send Location** — latitude, longitude, place name, and address.
- **Send Interactive Message** — message body plus up to 3 reply buttons. Button IDs are auto-generated from the button text.

### Message Template

- **Send Message Template** — fire a pre-configured Transactional Notification by webhook key. Pick the notification from a dropdown; n8n then fetches the template's variable schema and renders an input field for each variable (`header_image_url`, `body_variables_0`, etc.). Variables are sent in the format WANotifier expects, with `body_variables_*` and `button_variables_*` collapsed into arrays.

## Compatibility

Tested against n8n 1.94.0+. Built with `@n8n/node-cli`.

## Resources

- [WANotifier](https://wanotifier.com)
- [WANotifier API documentation](https://help.wanotifier.com/en/article/wanotifier-api/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE.md)
