// Google Apps Script for B3U forms (Stories, Contact, Newsletter)
// How to use:
// 1) In Google Drive, create a Google Sheet with three tabs:
//    Tab "Stories" with headers:
//      A:id  B:name  C:email  D:story  E:consent  F:status  G:createdAt  H:decidedAt
//    Tab "ContactForm" with headers:
//      A:id  B:name  C:email  D:subject  E:message  F:createdAt
//    Tab "Subscribers" with headers:
//      A:id  B:email  C:createdAt
// 2) In the Apps Script editor, set Project Properties > Script properties:
//    SHEET_ID        = <your Google Sheet ID>
//    MODERATOR_EMAIL = info@b3unstoppable.net
//    SECRET          = <long random string>
//    (Optional overrides)
//    STORIES_SHEET   = Stories
//    CONTACT_SHEET   = ContactForm
//    SUBS_SHEET      = Subscribers
// 3) Deploy as Web App: Execute as Me; Who has access: Anyone. Copy the Web App URL.
// 4) In the Next.js site, set NEXT_PUBLIC_FORMS_API to the Web App URL (ending with /exec).
// 5) Forms will POST to:
//    - POST {FORMS_API}/submit     -> Story submission
//    - POST {FORMS_API}/contact    -> Contact form
//    - POST {FORMS_API}/newsletter -> Newsletter subscription
//    - GET  {FORMS_API}/stories    -> Approved stories JSON (supports JSONP via ?callback=fn)
//    - GET  {FORMS_API}/moderate   -> Approve/Deny links (from moderator email)

const PROPS = PropertiesService.getScriptProperties();
// Prefer Script Properties; optionally hardcode as a fallback after the ||
const SHEET_ID = PROPS.getProperty('SHEET_ID') || '1BBzALy7nIymfzUuQ2hvga6YKCiv55bLiws16aDqEN3A';
// Individual sheet tabs for each form type (override via Script Properties if desired)
const STORIES_SHEET = PROPS.getProperty('STORIES_SHEET') || 'Stories';
const CONTACT_SHEET = PROPS.getProperty('CONTACT_SHEET') || 'ContactForm';
const SUBS_SHEET = PROPS.getProperty('SUBS_SHEET') || 'Subscribers';

const MODERATOR_EMAIL = PROPS.getProperty('MODERATOR_EMAIL') || 'info@b3unstoppable.net';
const SECRET = PROPS.getProperty('SECRET') || 'change-me';
const SITE_URL = PROPS.getProperty('SITE_URL') || 'https://b3uv3.vercel.app';
const MIN_FILL_MS = parseInt(PROPS.getProperty('MIN_FILL_MS') || '800', 10); // anti-bot: require ~0.8s between load and submit when t0 is present
const NAME_FIELD_MIN = 2;
const NAME_FIELD_MAX = 128;
const EMAIL_FIELD_MIN = 6;
const EMAIL_FIELD_MAX = 254;
const SUBJECT_FIELD_MIN = 12;
const SUBJECT_FIELD_MAX = 128;
const LONG_FIELD_MIN = 30;
const LONG_FIELD_MAX = 240;

// Headers for each sheet tab (row 1)
const STORIES_HEADERS = ['id','name','email','story','consent','status','createdAt','decidedAt'];
const CONTACT_HEADERS = ['id','name','email','subject','message','createdAt'];
const SUBS_HEADERS = ['id','email','createdAt'];

function ensureSheet(name, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers && headers.length) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  } else {
    // ensure headers present if empty
    if (sh.getLastRow() === 0 && headers && headers.length) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return sh;
}

function storiesSheet() { return ensureSheet(STORIES_SHEET, STORIES_HEADERS); }
function contactSheet() { return ensureSheet(CONTACT_SHEET, CONTACT_HEADERS); }
function subsSheet() { return ensureSheet(SUBS_SHEET, SUBS_HEADERS); }
function nowISO() { return new Date().toISOString(); }
function toWebToken(s) { return Utilities.base64EncodeWebSafe(s); }
function sign(payload) {
  // Ensure proper string inputs; Apps Script will throw if value is undefined/null
  const value = String(payload);
  const key = String(SECRET || '');
  const sig = Utilities.computeHmacSha256Signature(value, key);
  return toWebToken(sig);
}

function htmlPage(title, bodyHtml) {
  return HtmlService.createHtmlOutput(
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:40px auto">
       <h2>${title}</h2>
       ${bodyHtml}
       <p style="font-size:12px;color:#666">You can close this tab.</p>
     </div>`
  );
}

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nl2brSafe(value) {
  return esc(value).replace(/\n/g, '<br>');
}

function brandButton(url, label, background) {
  return `<a href="${esc(url || '#')}" style="display:inline-block;margin-right:10px;margin-bottom:10px;padding:12px 18px;border-radius:999px;background:${background || '#0A1A2A'};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">${esc(label || 'Open')}</a>`;
}

function brandDetailList(rows) {
  rows = Array.isArray(rows) ? rows : [];
  if (!rows.length) return '';
  return `<div style="border:1px solid #d7e5f0;border-radius:18px;background:#f8fbfe;padding:18px 20px;margin:0 0 18px;">${rows.map(function(row) {
    row = Array.isArray(row) ? row : [];
    return `<div style="margin:0 0 10px;"><strong style="display:block;color:#0A1A2A;margin-bottom:2px;">${esc(row[0])}</strong><span style="color:#36516a;">${esc(row[1])}</span></div>`;
  }).join('')}</div>`;
}

function brandContentCard(title, content) {
  return `<div style="border-left:4px solid #CC5500;background:#fff8f3;border-radius:16px;padding:18px 20px;margin:0 0 16px;"><div style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#CC5500;font-weight:700;margin-bottom:8px;">${esc(title)}</div><div style="color:#102437;">${content || ''}</div></div>`;
}

function brandEmailTemplate(params) {
  params = params || {};
  const eyebrow = esc(params.eyebrow || 'B3U Update');
  const title = params.title || 'B3U';
  const lead = params.lead || '';
  const body = params.body || '';
  const ctaHtml = params.ctaHtml || '';
  const logoUrl = getBrandLogoUrl();
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f8fb;color:#102437;font-family:Arial,Helvetica,sans-serif;">
    <div style="padding:32px 16px;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #d7e5f0;border-radius:24px;overflow:hidden;box-shadow:0 18px 48px rgba(10,26,42,0.12);">
        <div style="background:linear-gradient(135deg,#0A1A2A 0%,#173a58 100%);padding:28px 32px 24px;color:#ffffff;">
          <div style="margin:0 0 16px;">
            <img src="${logoUrl}" alt="B3U" width="84" height="84" style="display:block;width:84px;height:auto;border:0;outline:none;text-decoration:none;">
          </div>
          <div style="font-size:30px;line-height:1.1;font-weight:700;margin:0 0 8px;">Burn, Break, Become Unstoppable</div>
          <div style="font-size:14px;line-height:1.6;color:#d7e5f0;">Breaking Cycles. Building Legacies.</div>
        </div>
        <div style="padding:32px;">
          <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#CC5500;font-weight:700;margin-bottom:10px;">${eyebrow}</div>
          <h1 style="margin:0 0 12px;font-size:30px;line-height:1.15;color:#0A1A2A;">${title}</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#36516a;">${lead}</p>
          <div style="font-size:15px;line-height:1.7;color:#102437;">${body}</div>
          ${ctaHtml ? `<div style="margin-top:24px;">${ctaHtml}</div>` : ''}
        </div>
        <div style="padding:20px 32px 28px;border-top:1px solid #e4edf4;background:#fbfdff;color:#5a7389;font-size:13px;line-height:1.7;">
          You are receiving this email because of activity on B3U.<br>
          B3U exists to help people burn away fear, break destructive cycles, and become unstoppable.
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function getBrandLogoUrl() {
  return String(SITE_URL || 'https://b3uv3.vercel.app').replace(/\/$/, '') + '/images/logos/B3U3D.png';
}

function debugBlock(meta) {
  try {
    const json = JSON.stringify(meta || {}, null, 2)
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
      <div style="margin-top:16px;padding:12px;border:1px dashed #999;background:#fafafa">
        <div style="font-weight:bold;margin-bottom:6px">Debug</div>
        <pre style="white-space:pre-wrap;font-size:12px;">${json}</pre>
      </div>
      <script>
      try { window.top && window.top.postMessage({ source: 'b3u-forms', debug: ${JSON.stringify(meta || {})} }, '*'); } catch (e) {}
      </script>
    `;
  } catch (e) {
    return '';
  }
}

function respond(title, messageHtml, meta, debug) {
  const body = debug ? (messageHtml + debugBlock(meta)) : messageHtml;
  return htmlPage(title, body);
}

function findTooLongFields(route, payload) {
  const tooLong = [];

  function check(field, max) {
    const value = String(payload[field] || '').trim();
    if (value.length > max) tooLong.push(field);
  }

  if (route === 'contact') {
    check('name', NAME_FIELD_MAX);
    check('email', EMAIL_FIELD_MAX);
    check('subject', SUBJECT_FIELD_MAX);
    check('message', LONG_FIELD_MAX);
  }

  if (route === 'newsletter') {
    check('email', EMAIL_FIELD_MAX);
  }

  if (route === 'submit') {
    check('name', NAME_FIELD_MAX);
    check('email', EMAIL_FIELD_MAX);
    check('story', LONG_FIELD_MAX);
  }

  return tooLong;
}

function findTooShortFields(route, payload) {
  const tooShort = [];

  function check(field, min, required) {
    const value = String(payload[field] || '').trim();
    if (!value && !required) return;
    if (value.length < min) tooShort.push(field);
  }

  if (route === 'contact') {
    check('name', NAME_FIELD_MIN, true);
    check('email', EMAIL_FIELD_MIN, true);
    check('subject', SUBJECT_FIELD_MIN, false);
    check('message', LONG_FIELD_MIN, true);
  }

  if (route === 'newsletter') {
    check('email', EMAIL_FIELD_MIN, true);
  }

  if (route === 'submit') {
    check('name', NAME_FIELD_MIN, true);
    check('email', EMAIL_FIELD_MIN, true);
    check('story', LONG_FIELD_MIN, true);
  }

  return tooShort;
}

function findRowById(id) {
  const s = storiesSheet();
  const last = s.getLastRow();
  if (last < 2) return null; // only headers
  const values = s.getRange(2, 1, last - 1, 8).getValues(); // A:H
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === id) return { rowIndex: i + 2, row: values[i] };
  }
  return null;
}

function findRowByIdInSheet(sheet, id, width) {
  const last = sheet.getLastRow();
  if (last < 2) return null;
  const values = sheet.getRange(2, 1, last - 1, width).getValues();
  for (let i = 0; i < values.length; i++) {
    if ((values[i][0] || '').toString() === id) return { rowIndex: i + 2, row: values[i] };
  }
  return null;
}

function upsertRowById(sheet, id, row) {
  const found = findRowByIdInSheet(sheet, id, row.length);
  if (found) {
    sheet.getRange(found.rowIndex, 1, 1, row.length).setValues([row]);
    return found.rowIndex;
  }
  sheet.appendRow(row);
  return sheet.getLastRow();
}

// ---- Handlers ----
// POST router: /submit, /contact, /newsletter
function doPost(e) {
  e = e || { parameter: {}, pathInfo: '' };
  const path = (String(e.pathInfo || '')).replace(/^\//, '').toLowerCase();
  const endpoint = (e.parameter && (e.parameter.endpoint || e.parameter.action || '')).toString().toLowerCase();
  const route = path || endpoint; // prefer pathInfo, fallback to ?endpoint=
  const debug = String((e.parameter && e.parameter.debug) || '') === '1' || String((e.parameter && e.parameter.debug) || '').toLowerCase() === 'true';
  if (route === 'submit') return handleStorySubmit(e);
  if (route === 'contact') return handleContact(e);
  if (route === 'newsletter') return handleNewsletter(e);
  // default fallback
  const meta = { method: 'POST', route, path, endpoint, note: 'Unknown POST endpoint' };
  return respond('B3U Forms', '<p>Unknown POST endpoint.</p>', meta, debug);
}

// GET router: /stories (JSON / JSONP), /moderate (approve/deny), default info
function doGet(e) {
  e = e || { parameter: {}, pathInfo: '' };
  const path = (String(e.pathInfo || '')).replace(/^\//, '').toLowerCase();
  if (path === 'stories' || (e.parameter.endpoint || '').toLowerCase() === 'stories') {
    return handleStoriesList(e);
  }
  if (path === 'moderate' || (e.parameter.endpoint || '').toLowerCase() === 'moderate') {
    return handleModerate(e);
  }
  const debug = String((e.parameter && e.parameter.debug) || '') === '1' || String((e.parameter && e.parameter.debug) || '').toLowerCase() === 'true';
  const meta = { method: 'GET', path, info: 'root' };
  return respond('B3U Forms API', '<p>Use /submit, /contact, /newsletter (POST), /stories (GET), or /moderate (GET).</p>', meta, debug);
}

// ---- Story Submission ----
function handleStorySubmit(e) {
  try {
    const p = e.parameter || {};
    const debug = String(p.debug || '') === '1' || String(p.debug || '').toLowerCase() === 'true';
    const skipEmails = String(p.skipEmails || '') === '1' || String(p.skipEmails || '').toLowerCase() === 'true';
    const skipPersist = String(p.skipPersist || '') === '1' || String(p.skipPersist || '').toLowerCase() === 'true';
    // Basic bot checks: honeypot and minimum fill time (configurable)
    const hp = (p.hp || '').toString();
    const t0 = Number(p.t0 || '0');
    const now = Date.now();
    const delta = now - t0;
    if (hp) return respond('Thanks', '<p>Thanks!</p>', { endpoint: 'submit', hp: !!hp, delta }, debug);
    if (t0 && (delta < MIN_FILL_MS || delta > 86400000)) return respond('Thanks', '<p>Thanks!</p>', { endpoint: 'submit', hp: !!hp, delta, note: 'timing-guard' }, debug);
    const name = (p.name || '').toString().trim();
    const email = (p.email || '').toString().trim();
    const story = (p.story || '').toString().trim();
    const consent = p.consent ? 'on' : '';
    if (!name || !email || !story) {
      return respond('Missing fields', '<p>Please provide name, email, and story.</p>', { endpoint: 'submit', name: !!name, email: !!email, story: !!story }, debug);
    }
    const tooLong = findTooLongFields('submit', { name: name, email: email, story: story });
    if (tooLong.length) {
      return respond('Too long', '<p>Please keep story submissions within the allowed length.</p>', { endpoint: 'submit', tooLong: tooLong }, debug);
    }
    const tooShort = findTooShortFields('submit', { name: name, email: email, story: story });
    if (tooShort.length) {
      return respond('Too short', '<p>Please complete story submissions using the minimum required length.</p>', { endpoint: 'submit', tooShort: tooShort }, debug);
    }
    const id = (p.id || Utilities.getUuid()).toString();
    const createdAt = (p.createdAt || nowISO()).toString();
    if (!skipPersist) {
      upsertRowById(storiesSheet(), id, [id, name, email, story, consent, 'pending', createdAt, '']);
    }

    // Confirm to sender (no-reply)
    if (!skipEmails) {
      MailApp.sendEmail({
        to: email,
        name: 'B3U',
        replyTo: 'no-reply@b3unstoppable.net',
        subject: 'We received your story — B3U',
        htmlBody: brandEmailTemplate({
          eyebrow: 'Story Received',
          title: `Thank you for sharing, ${esc(name)}`,
          lead: 'Your story has been received by B3U and is now in review.',
          body: `<p style="margin:0 0 16px;">We know these submissions are personal. Thank you for trusting us with yours.</p>${brandContentCard('Your submission', nl2brSafe(story))}<p style="margin:16px 0 0;">We will follow up after review.</p>`
        })
      });
    }

    // Email moderators with Approve/Deny
    const baseUrl = ScriptApp.getService().getUrl();
    const token = sign(id);
    const approveUrl = `${baseUrl}/moderate?id=${encodeURIComponent(id)}&action=approve&token=${encodeURIComponent(token)}`;
    const denyUrl = `${baseUrl}/moderate?id=${encodeURIComponent(id)}&action=deny&token=${encodeURIComponent(token)}`;

    if (!skipEmails) {
      MailApp.sendEmail({
        to: MODERATOR_EMAIL,
        name: 'B3U Submissions',
        subject: `New Story Submission from ${name}`,
        htmlBody: brandEmailTemplate({
          eyebrow: 'Story Submission',
          title: `New community story from ${esc(name)}`,
          lead: 'A new story is ready for website.',
          body: `${brandDetailList([
            ['Name', esc(name)],
            ['Email', esc(email)]
          ])}${brandContentCard('Story', nl2brSafe(story))}`,
          ctaHtml: `${brandButton(approveUrl, 'Approve Story', '#0A8F5A')} ${brandButton(denyUrl, 'Deny Story', '#B42318')}`
        })
      });
    }

    return respond('Thanks!', '<p>Your story was received. Please check your email for confirmation.</p>', { endpoint: 'submit', ok: true, id, delta }, debug);
  } catch (err) {
    return respond('Error', `<p>${String(err)}</p>`, { endpoint: 'submit', ok: false, error: String(err) }, (e && e.parameter && (String(e.parameter.debug||'')==='1' || String(e.parameter.debug||'').toLowerCase()==='true')));
  }
}

// ---- Contact Form ----
function handleContact(e) {
  try {
    const p = e.parameter || {};
    const debug = String(p.debug || '') === '1' || String(p.debug || '').toLowerCase() === 'true';
    const skipEmails = String(p.skipEmails || '') === '1' || String(p.skipEmails || '').toLowerCase() === 'true';
    const skipPersist = String(p.skipPersist || '') === '1' || String(p.skipPersist || '').toLowerCase() === 'true';
    const hp = (p.hp || '').toString();
    const t0 = Number(p.t0 || '0');
    const now = Date.now();
    const delta = now - t0;
    if (hp) return respond('Message sent', '<p>Thanks! Your message was sent.</p>', { endpoint: 'contact', hp: !!hp, delta }, debug);
    if (t0 && (delta < MIN_FILL_MS || delta > 86400000)) return respond('Message sent', '<p>Thanks! Your message was sent.</p>', { endpoint: 'contact', hp: !!hp, delta, note: 'timing-guard' }, debug);
    const name = (p.name || '').toString().trim();
    const email = (p.email || '').toString().trim();
    const subject = (p.subject || 'Contact Form').toString().trim();
    const message = (p.message || '').toString().trim();
    if (!name || !email || !message) {
      return respond('Missing fields', '<p>Please provide name, email, and message.</p>', { endpoint: 'contact', name: !!name, email: !!email, message: !!message }, debug);
    }
    const tooLong = findTooLongFields('contact', { name: name, email: email, subject: subject, message: message });
    if (tooLong.length) {
      return respond('Too long', '<p>Please keep contact form fields within the allowed length.</p>', { endpoint: 'contact', tooLong: tooLong }, debug);
    }
    const tooShort = findTooShortFields('contact', { name: name, email: email, subject: subject, message: message });
    if (tooShort.length) {
      return respond('Too short', '<p>Please complete contact fields using the minimum required length.</p>', { endpoint: 'contact', tooShort: tooShort }, debug);
    }

    // Persist to ContactForm sheet
    const id = (p.id || Utilities.getUuid()).toString();
    const createdAt = (p.createdAt || nowISO()).toString();
    if (!skipPersist) {
      upsertRowById(contactSheet(), id, [id, name, email, subject, message, createdAt]);
    }

    // Email moderator inbox
    if (!skipEmails) {
      MailApp.sendEmail({
        to: MODERATOR_EMAIL,
        name: 'B3U Website',
        subject: `[Contact] ${subject} — ${name}`,
        htmlBody: brandEmailTemplate({
          eyebrow: 'Contact Request',
          title: `New message from ${esc(name)}`,
          lead: 'A new inquiry came in through the B3U website contact form.',
          body: `${brandDetailList([
            ['Name', esc(name)],
            ['Email', esc(email)],
            ['Subject', esc(subject)]
          ])}${brandContentCard('Message', nl2brSafe(message))}`
        })
      });
    }

    // Acknowledge sender (no-reply)
    if (!skipEmails) {
      MailApp.sendEmail({
        to: email,
        name: 'B3U',
        replyTo: 'no-reply@b3unstoppable.net',
        subject: 'We received your message — B3U',
        htmlBody: brandEmailTemplate({
          eyebrow: 'Message Received',
          title: `Thanks for reaching out, ${esc(name)}`,
          lead: 'Your message is in our inbox. We typically reply within 1-2 business days.',
          body: `<p style="margin:0 0 16px;">We appreciate you taking the time to connect with B3U. If your note is time-sensitive, reply directly to this email and our team will see it.</p>${brandContentCard('What you sent', `<p style="margin:0 0 8px;"><strong>Subject:</strong> ${esc(subject)}</p><div>${nl2brSafe(message)}</div>`)}`
        })
      });
    }

    return respond('Message sent', '<p>Thanks! Your message was sent. We’ll be in touch soon.</p>', { endpoint: 'contact', ok: true, delta }, debug);
  } catch (err) {
    return respond('Error', `<p>${String(err)}</p>`, { endpoint: 'contact', ok: false, error: String(err) }, (e && e.parameter && (String(e.parameter.debug||'')==='1' || String(e.parameter.debug||'').toLowerCase()==='true')));
  }
}

// ---- Newsletter ----
function handleNewsletter(e) {
  try {
    const p = e.parameter || {};
    const debug = String(p.debug || '') === '1' || String(p.debug || '').toLowerCase() === 'true';
    const skipEmails = String(p.skipEmails || '') === '1' || String(p.skipEmails || '').toLowerCase() === 'true';
    const skipPersist = String(p.skipPersist || '') === '1' || String(p.skipPersist || '').toLowerCase() === 'true';
    const hp = (p.hp || '').toString();
    const t0 = Number(p.t0 || '0');
    const now = Date.now();
    const delta = now - t0;
    if (hp) return respond('Subscribed', '<p>Thanks! You’re subscribed.</p>', { endpoint: 'newsletter', hp: !!hp, delta }, debug);
    if (t0 && (delta < MIN_FILL_MS || delta > 86400000)) return respond('Subscribed', '<p>Thanks! You’re subscribed.</p>', { endpoint: 'newsletter', hp: !!hp, delta, note: 'timing-guard' }, debug);
    const email = (p.email || '').toString().trim();
    if (!email) return respond('Missing fields', '<p>Please provide an email.</p>', { endpoint: 'newsletter', email: !!email }, debug);
    const tooLong = findTooLongFields('newsletter', { email: email });
    if (tooLong.length) return respond('Too long', '<p>Please keep newsletter fields within the allowed length.</p>', { endpoint: 'newsletter', tooLong: tooLong }, debug);
    const tooShort = findTooShortFields('newsletter', { email: email });
    if (tooShort.length) return respond('Too short', '<p>Please complete newsletter fields using the minimum required length.</p>', { endpoint: 'newsletter', tooShort: tooShort }, debug);

    // Persist to Subscribers sheet
    const id = (p.id || Utilities.getUuid()).toString();
    const createdAt = (p.createdAt || nowISO()).toString();
    if (!skipPersist) {
      upsertRowById(subsSheet(), id, [id, email, createdAt]);
    }

    // Notify moderator (optional)
    if (!skipEmails) {
      MailApp.sendEmail({
        to: MODERATOR_EMAIL,
        name: 'B3U Website',
        subject: `[Newsletter] New subscription: ${email}`,
        htmlBody: brandEmailTemplate({
          eyebrow: 'Newsletter Signup',
          title: 'A new subscriber joined The Take Back Weekly',
          lead: 'B3U has a new newsletter subscription.',
          body: brandDetailList([['Subscriber', esc(email)]])
        })
      });
    }

    // Autoresponse to subscriber (no-reply)
    if (!skipEmails) {
      MailApp.sendEmail({
        to: email,
        name: 'B3U',
        replyTo: 'no-reply@b3unstoppable.net',
        subject: 'You’re subscribed — B3U',
        htmlBody: brandEmailTemplate({
          eyebrow: 'Welcome To B3U',
          title: 'You are subscribed to The Take Back Weekly',
          lead: 'You are officially on the list for new episodes, community updates, and encouragement from B3U.',
          body: '<p style="margin:0 0 16px;">Expect thoughtful updates built around the B3U mission: Burn, Break, Become Unstoppable.</p><p style="margin:0;">We are glad you are here.</p>'
        })
      });
    }

    return respond('Subscribed', '<p>Thanks! You’re subscribed.</p>', { endpoint: 'newsletter', ok: true, delta }, debug);
  } catch (err) {
    return respond('Error', `<p>${String(err)}</p>`, { endpoint: 'newsletter', ok: false, error: String(err) }, (e && e.parameter && (String(e.parameter.debug||'')==='1' || String(e.parameter.debug||'').toLowerCase()==='true')));
  }
}

// ---- Approved Stories list (JSON + JSONP) ----
function handleStoriesList(e) {
  try {
    const s = storiesSheet();
    const last = s.getLastRow();
    let out = { stories: [] };
    if (last >= 2) {
      const values = s.getRange(2, 1, last - 1, 8).getValues(); // A:H
      const approved = values
        .filter(r => (r[5] || '').toString().toLowerCase() === 'approved')
        .map(r => ({ id: r[0], name: r[1], story: r[3], createdAt: r[6] }))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      out.stories = approved;
    }

    const cb = (e.parameter && e.parameter.callback) ? e.parameter.callback.toString() : '';
    if (cb) {
      // JSONP: return callback(<json>)
      const js = `${cb}(${JSON.stringify(out)});`;
      const output = ContentService.createTextOutput(js);
      output.setMimeType(ContentService.MimeType.JAVASCRIPT);
      return output;
    }

    const output = ContentService.createTextOutput(JSON.stringify(out));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  } catch (err) {
    const output = ContentService.createTextOutput(JSON.stringify({ stories: [], error: String(err) }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// ---- Approve / Deny ----
function handleModerate(e) {
  e = e || { parameter: {} };
  const id = (e.parameter.id || '').toString();
  const action = (e.parameter.action || '').toString().toLowerCase(); // approve|deny
  const token = (e.parameter.token || '').toString();

  if (!id || !action || !token) {
    return htmlPage('Invalid Link', '<p>Missing parameters.</p>');
  }
  const expected = sign(id);
  if (token !== expected) {
    return htmlPage('Invalid Link', '<p>Signature check failed.</p>');
  }
  const found = findRowById(id);
  if (!found) return htmlPage('Not Found', '<p>Submission not found.</p>');

  const s = storiesSheet();
  const rowIndex = found.rowIndex;
  const row = s.getRange(rowIndex, 1, 1, 8).getValues()[0];
  const name = row[1];
  const email = row[2];

  const newStatus = action === 'approve' ? 'approved' : 'denied';
  s.getRange(rowIndex, 6).setValue(newStatus); // F: status
  s.getRange(rowIndex, 8).setValue(nowISO());  // H: decidedAt

  // Notify sender
  try {
    const subj = newStatus === 'approved' ? 'Your story was approved — B3U' : 'Your story was not approved — B3U';
    const body = newStatus === 'approved'
      ? brandEmailTemplate({
          eyebrow: 'Story Approved',
          title: `Your story was approved, ${esc(name)}`,
          lead: 'Your submission is now approved and ready to encourage the B3U community.',
          body: '<p style="margin:0;">Thank you for sharing your story and helping someone else see what is possible on the other side of hard seasons.</p>'
        })
      : brandEmailTemplate({
          eyebrow: 'Story Update',
          title: `Thank you for sharing, ${esc(name)}`,
          lead: 'We reviewed your submission and are not able to publish it at this time.',
          body: '<p style="margin:0;">We appreciate your honesty, your courage, and your trust in B3U. Even when a story is not published, it still matters.</p>'
        });
  MailApp.sendEmail({ to: email, subject: subj, htmlBody: body, name: 'B3U', replyTo: 'no-reply@b3unstoppable.net' });
  } catch (err) {}

  const title = newStatus === 'approved' ? 'Approved' : 'Denied';
  return htmlPage(`Story ${title}`, `<p>The story from <strong>${name}</strong> has been marked <strong>${newStatus}</strong>.</p>`);
}