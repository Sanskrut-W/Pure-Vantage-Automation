// npx ts-node tools/video-to-test/snapshot.ts "<component name | /main/... path>" [--click "<text>"]... [--scope dialog]
//
// Opens a PureVantage page with the saved SSO session (auth.json + session.json, same as
// fixtures/baseFixture.ts) and prints what's on it — the accessibility tree plus every visible
// interactive element with its id / aria-label / placeholder / PrimeNG class — so locators can be
// taken from the live DOM instead of guessed from a recording or asked for as outerHTML.
//
// Examples:
//   npx ts-node tools/video-to-test/snapshot.ts "Recurring Rewards"
//   npx ts-node tools/video-to-test/snapshot.ts "Recurring Rewards" --click "Create Configuration" --scope dialog
//   npx ts-node tools/video-to-test/snapshot.ts /main/component-display/stencil-marketing/leaderboard-component
//
// READ-ONLY: --click is for opening popups/tabs/menus to inspect them. Never use it on Save,
// Delete, Yes, Approve or anything else that changes data.

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { envConfig } from '../../config/envConfig';
import { componentUrlConfigs } from '../../config/componentUrlConfig';

const BLOCKED_CLICKS = /^(save|delete|yes|approve|decline|submit|confirm|finish|remove|publish|schedule|send)$/i;

type Options = { target: string; clicks: string[]; scope: 'main' | 'dialog' };

function parseArgs(argv: string[]): Options {
    const opts: Options = { target: '', clicks: [], scope: 'main' };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--click') opts.clicks.push(argv[++i]);
        else if (argv[i] === '--scope') opts.scope = argv[++i] === 'dialog' ? 'dialog' : 'main';
        else opts.target = argv[i];
    }
    return opts;
}

function resolvePath(target: string): string {
    if (target.startsWith('/')) return target;
    const byName = componentUrlConfigs.find((c) => c.name.toLowerCase() === target.toLowerCase());
    if (byName) return byName.url;
    const names = componentUrlConfigs.map((c) => c.name).join(', ');
    throw new Error(`"${target}" is not in config/componentUrlConfig.ts. Pass a /main/... path instead.\nKnown: ${names}`);
}

(async () => {
    const { target, clicks, scope } = parseArgs(process.argv.slice(2));
    if (!target) {
        console.error('Usage: npx ts-node tools/video-to-test/snapshot.ts "<component name | /main/... path>" [--click "<text>"]... [--scope dialog]');
        process.exit(1);
    }
    const blocked = clicks.find((c) => BLOCKED_CLICKS.test(c.trim()));
    if (blocked) throw new Error(`Refusing to click "${blocked}" — snapshot.ts is read-only.`);

    const root = path.join(__dirname, '../..');
    const authFile = path.join(root, 'auth.json');
    const sessionFile = path.join(root, 'session.json');
    if (!fs.existsSync(authFile)) throw new Error('auth.json not found — run `npm run auth` first.');

    const origin = new URL(envConfig.baseURL).origin;
    const browser = await chromium.launch();
    try {
        const context = await browser.newContext({
            baseURL: origin,
            ignoreHTTPSErrors: true,
            storageState: authFile,
            viewport: { width: 1600, height: 900 },
        });

        // Same sessionStorage injection as fixtures/baseFixture.ts.
        if (fs.existsSync(sessionFile)) {
            const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
            await context.addInitScript((data) => {
                if (window.location.hostname.includes('osiristrading.net') || window.location.hostname.includes('osiristrading.com')) {
                    for (const [key, value] of Object.entries(data)) {
                        if (key === 'initialRoute') continue;
                        window.sessionStorage.setItem(key, value as string);
                    }
                }
            }, sessionData);
        }

        const page = await context.newPage();
        const urlPath = resolvePath(target);
        await page.goto(urlPath, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch((error: Error) => {
            if (/ERR_NAME_NOT_RESOLVED|ERR_CONNECTION/.test(error.message)) {
                throw new Error(`Can't reach ${origin} — connect to the VPN / office network and retry.`);
            }
            throw error;
        });
        await page.locator('pure-page-loader').first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

        if (/login\.microsoftonline|\/login/i.test(page.url())) {
            throw new Error(`Redirected to sign-in (${page.url()}) — the saved session has expired. Run \`npm run auth\` and retry.`);
        }

        for (const text of clicks) {
            const candidate = page
                .getByRole('button', { name: text, exact: true })
                .or(page.getByRole('tab', { name: text, exact: true }))
                .or(page.getByRole('link', { name: text, exact: true }))
                .or(page.locator(`span.menuitem-text:text-is("${text}")`))
                .first();
            await candidate.click({ timeout: 15000 });
            await page.waitForTimeout(800);
            console.log(`(clicked "${text}")`);
        }

        const container = scope === 'dialog'
            ? page.locator('div[role="dialog"]').last()
            : page.locator('main').first().or(page.locator('body')).first();
        await container.waitFor({ state: 'visible', timeout: 15000 });

        console.log(`# ${page.url()}\n`);
        console.log('## Accessibility tree\n');
        console.log(await container.ariaSnapshot());

        const elements = await container.evaluate((rootEl) => {
            const selector = [
                'input', 'textarea', 'button', 'a[href]', '[role="button"]', '[role="tab"]',
                '[role="checkbox"]', '[role="switch"]', '[role="combobox"]',
                '.p-dropdown', '.p-multiselect', '.p-calendar', '.p-inputnumber', '.p-checkbox',
                '.p-inputswitch', '.p-radiobutton', '.pure__table', '[id]',
            ].join(',');
            const seen = new Set<Element>();
            const rows: string[] = [];
            rootEl.querySelectorAll(selector).forEach((el) => {
                if (seen.has(el)) return;
                seen.add(el);
                const html = el as HTMLElement;
                if (!html.offsetParent && getComputedStyle(html).position !== 'fixed') return;
                const attrs: string[] = [];
                for (const a of ['id', 'name', 'type', 'aria-label', 'placeholder', 'formcontrolname', 'data-pc-name']) {
                    const v = el.getAttribute(a);
                    if (v) attrs.push(`${a}="${v}"`);
                }
                const primeClass = Array.from(el.classList).find((c) => /^(p-|pure__)/.test(c) && !/-(focus|highlight|disabled|hidden)$/.test(c));
                if (primeClass) attrs.push(`class~="${primeClass}"`);
                if (!attrs.length) return;
                const text = (html.innerText || (el as HTMLInputElement).value || '').trim().replace(/\s+/g, ' ').slice(0, 50);
                const disabled = (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true' ? ' [disabled]' : '';
                rows.push(`${el.tagName.toLowerCase()} ${attrs.join(' ')}${text ? `  "${text}"` : ''}${disabled}`);
            });
            return rows;
        });
        console.log('\n## Visible elements with ids / labels\n');
        console.log(elements.join('\n'));
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error('❌', error.message);
    process.exit(1);
});
