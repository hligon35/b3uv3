// Google Apps Script for B3U forms (Stories, Contact, Newsletter)
// How to use:
// 1) In Google Drive, create a Google Sheet (e.g., "B3U Stories") with headers:
//    A:id  B:name  C:email  D:story  E:consent  F:status  G:createdAt  H:decidedAt
//    (You can change the sheet name below if needed.)
// 2) In the Apps Script editor, set Project Properties > Script properties:
//    SHEET_ID       = <your Google Sheet ID>
//    MODERATOR_EMAIL= info@b3unstoppable.net
//    SECRET         = <long random string>
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
const SHEET_NAME = 'Sheet1'; // Change if your stories sheet has a different tab name
const MODERATOR_EMAIL = PROPS.getProperty('MODERATOR_EMAIL') || 'info@b3unstoppable.net';
const SECRET = PROPS.getProperty('SECRET') || 'change-me';

function sheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}
function nowISO() { return new Date().toISOString(); }
function toWebToken(s) { return Utilities.base64EncodeWebSafe(s); }
function sign(payload) {
  const sig = Utilities.computeHmacSha256Signature(payload, SECRET);
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

function findRowById(id) {
  const s = sheet();
  const last = s.getLastRow();
  if (last < 2) return null; // only headers
  const values = s.getRange(2, 1, last - 1, 8).getValues(); // A:H
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === id) return { rowIndex: i + 2, row: values[i] };
  }
  return null;
}

// ---- Handlers ----
// POST router: /submit, /contact, /newsletter
function doPost(e) {
  const path = (e.pathInfo || '').replace(/^\//, '').toLowerCase();
  if (path === 'submit') return handleStorySubmit(e);
  if (path === 'contact') return handleContact(e);
  if (path === 'newsletter') return handleNewsletter(e);
  // default fallback
  return htmlPage('B3U Forms', '<p>Unknown POST endpoint.</p>');
}

// GET router: /stories (JSON / JSONP), /moderate (approve/deny), default info
function doGet(e) {
  const path = (e.pathInfo || '').replace(/^\//, '').toLowerCase();
  if (path === 'stories' || (e.parameter.endpoint || '').toLowerCase() === 'stories') {
    return handleStoriesList(e);
  }
  if (path === 'moderate' || (e.parameter.endpoint || '').toLowerCase() === 'moderate') {
    return handleModerate(e);
  }
  return htmlPage('B3U Forms API', '<p>Use /submit, /contact, /newsletter (POST), /stories (GET), or /moderate (GET).</p>');
}

// ---- Story Submission ----
function handleStorySubmit(e) {
  try {
    const p = e.parameter || {};
    const name = (p.name || '').toString().trim();
    const email = (p.email || '').toString().trim();
    const story = (p.story || '').toString().trim();
    const consent = p.consent ? 'on' : '';
    if (!name || !email || !story) {
      return htmlPage('Missing fields', '<p>Please provide name, email, and story.</p>');
    }
    const id = Utilities.getUuid();
    const createdAt = nowISO();
    sheet().appendRow([id, name, email, story, consent, 'pending', createdAt, '']);

    // Confirm to sender
    MailApp.sendEmail({
      to: email,
      name: 'B3U',
      subject: 'We received your story — B3U',
      htmlBody: `<p>Hi ${name},</p>
                 <p>Thanks for sharing your story with B3U. Our team will review it shortly.</p>
                 <p>We’ll email you once a decision is made.</p>
                 <p>— Team B3U</p>`
    });

    // Email moderators with Approve/Deny
    const baseUrl = ScriptApp.getService().getUrl();
    const token = sign(id);
    const approveUrl = `${baseUrl}/moderate?id=${encodeURIComponent(id)}&action=approve&token=${encodeURIComponent(token)}`;
    const denyUrl = `${baseUrl}/moderate?id=${encodeURIComponent(id)}&action=deny&token=${encodeURIComponent(token)}`;

    MailApp.sendEmail({
      to: MODERATOR_EMAIL,
      name: 'B3U Submissions',
      subject: `New Story Submission from ${name}`,
      htmlBody: `<p><strong>${name}</strong> submitted a story.</p>
                 <p><strong>Email:</strong> ${email}</p>
                 <p><strong>Story:</strong></p>
                 <blockquote>${story.replace(/\n/g, '<br>')}</blockquote>
                 <p>
                   <a href="${approveUrl}" style="background:#10B981;color:#fff;text-decoration:none;padding:10px 14px;border-radius:6px;">Approve</a>
                   &nbsp;
                   <a href="${denyUrl}" style="background:#EF4444;color:#fff;text-decoration:none;padding:10px 14px;border-radius:6px;">Deny</a>
                 </p>`
    });

    return htmlPage('Thanks!', '<p>Your story was received. Please check your email for confirmation.</p>');
  } catch (err) {
    return htmlPage('Error', `<p>${String(err)}</p>`);
  }
}

// ---- Contact Form ----
function handleContact(e) {
  try {
    const p = e.parameter || {};
    const name = (p.name || '').toString().trim();
    const email = (p.email || '').toString().trim();
    const subject = (p.subject || 'Contact Form').toString().trim();
    const message = (p.message || '').toString().trim();
    if (!name || !email || !message) {
      return htmlPage('Missing fields', '<p>Please provide name, email, and message.</p>');
    }

    // Email moderator inbox
    MailApp.sendEmail({
      to: MODERATOR_EMAIL,
      name: 'B3U Website',
      subject: `[Contact] ${subject} — ${name}`,
      htmlBody: `<p><strong>Name:</strong> ${name}</p>
                 <p><strong>Email:</strong> ${email}</p>
                 <p><strong>Subject:</strong> ${subject}</p>
                 <p><strong>Message:</strong></p>
                 <blockquote>${message.replace(/\n/g, '<br>')}</blockquote>`
    });

    // Acknowledge sender
    MailApp.sendEmail({
      to: email,
      name: 'B3U',
      subject: 'We received your message — B3U',
      htmlBody: `<p>Hi ${name},</p>
                 <p>Thanks for reaching out. We received your message and typically reply within 1–2 business days.</p>
                 <p>— Team B3U</p>`
    });

    return htmlPage('Message sent', '<p>Thanks! Your message was sent. We’ll be in touch soon.</p>');
  } catch (err) {
    return htmlPage('Error', `<p>${String(err)}</p>`);
  }
}

// ---- Newsletter ----
function handleNewsletter(e) {
  try {
    const p = e.parameter || {};
    const email = (p.email || '').toString().trim();
    if (!email) return htmlPage('Missing fields', '<p>Please provide an email.</p>');

    // Optional: store to a separate sheet or a tab in same sheet
    // Append to the same sheet with a special status row for simplicity
    const id = Utilities.getUuid();
    const createdAt = nowISO();
    sheet().appendRow([id, 'Newsletter', email, '', '', 'newsletter', createdAt, '']);

    // Notify moderator (optional)
    MailApp.sendEmail({
      to: MODERATOR_EMAIL,
      name: 'B3U Website',
      subject: `[Newsletter] New subscription: ${email}`,
      htmlBody: `<p>New newsletter subscriber: <strong>${email}</strong></p>`
    });

    // Autoresponse to subscriber
    MailApp.sendEmail({
      to: email,
      name: 'B3U',
      subject: 'You’re subscribed — B3U',
      htmlBody: `<p>Thanks for joining The Take Back Weekly! You’re on the list.</p>
                 <p>Look out for new episodes, inspiration, and community updates from B3U.</p>
                 <p>— Team B3U</p>`
    });

    return htmlPage('Subscribed', '<p>Thanks! You’re subscribed.</p>');
  } catch (err) {
    return htmlPage('Error', `<p>${String(err)}</p>`);
  }
}

// ---- Approved Stories list (JSON + JSONP) ----
function handleStoriesList(e) {
  try {
    const s = sheet();
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

  const s = sheet();
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
      ? `<p>Hi ${name},</p><p>Your story was approved and is now visible in our community section. Thank you for sharing and inspiring others.</p><p>— Team B3U</p>`
      : `<p>Hi ${name},</p><p>Thank you for sharing your story. After review, we’re not able to publish this submission at this time. We appreciate your courage and support.</p><p>— Team B3U</p>`;
    MailApp.sendEmail({ to: email, subject: subj, htmlBody: body, name: 'B3U' });
  } catch (err) {}

  const title = newStatus === 'approved' ? 'Approved' : 'Denied';
  return htmlPage(`Story ${title}`, `<p>The story from <strong>${name}</strong> has been marked <strong>${newStatus}</strong>.</p>`);
}
