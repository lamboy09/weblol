// KAUSHALYA DARSHINI - admin gateway (Vercel serverless function, Node runtime)
//
// SECURITY MODEL
// - Every operation requires the admin access code, supplied from the frontend
//   in the "x-admin-code" header and compared (timing-safe) against the
//   ADMIN_ACCESS_CODE environment variable. It is a convenience barrier.
// - All privileged Supabase operations use the SERVICE ROLE key, read from the
//   environment only. It never reaches the frontend.
// - Anonymous frontend keys can only READ published rows (row level security).

import crypto from 'node:crypto';

const ALLOWED_UPLOAD_EXT = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_DESCRIPTION = 2000;

function env(name, fallbackNames = []) {
    for (const n of [name, ...fallbackNames]) {
        const v = process.env[n];
        if (v) return v;
    }
    return '';
}

function supaUrl() {
    return env('SUPABASE_URL', ['NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL']);
}

function supaServiceKey() {
    return env('SUPABASE_SERVICE_ROLE_KEY', ['SUPABASE_SECRET_KEY']);
}

function adminCode() {
    return env('ADMIN_ACCESS_CODE');
}

function safeEqual(a, b) {
    const ba = Buffer.from(String(a === undefined || a === null ? '' : a));
    const bb = Buffer.from(String(b === undefined || b === null ? '' : b));
    if (ba.length !== bb.length || ba.length === 0) return false;
    return crypto.timingSafeEqual(ba, bb);
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'content-type': 'application/json; charset=utf-8' }
    });
}

function missingConfigResponse() {
    const missing = [];
    if (!supaUrl()) missing.push('SUPABASE_URL');
    if (!supaServiceKey()) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!adminCode()) missing.push('ADMIN_ACCESS_CODE');
    if (missing.length) {
        return json({ error: 'Server is not configured. Missing environment variables: ' + missing.join(', ') }, 500);
    }
    return null;
}

// ---- Supabase REST helpers (service role, bypasses RLS) ----

async function supabaseFetch(path, options = {}) {
    const res = await fetch(supaUrl() + path, {
        ...options,
        headers: {
            apikey: supaServiceKey(),
            Authorization: 'Bearer ' + supaServiceKey(),
            ...(options.headers || {})
        }
    });
    return res;
}

async function listAllRows() {
    const res = await supabaseFetch('/rest/v1/gallery_images?select=*&order=created_at.desc', { method: 'GET' });
    if (!res.ok) throw new Error('Could not read gallery records (' + res.status + ')');
    return res.json();
}

async function upsertDescription({ src, class_key, subject, description }) {
    const clean = String(description || '').slice(0, MAX_DESCRIPTION);
    const row = {
        src: String(src).slice(0, 500),
        class_key: String(class_key),
        subject: String(subject).slice(0, 80),
        description: clean,
        published: true
    };
    const res = await supabaseFetch(
        '/rest/v1/gallery_images?on_conflict=src',
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify(row)
        }
    );
    if (!res.ok) throw new Error('Saving description failed (' + res.status + ')');
    const saved = await res.json();
    return saved[0];
}

async function setBasicFields(id, patch) {
    const res = await supabaseFetch(
        '/rest/v1/gallery_images?id=eq.' + encodeURIComponent(id),
        {
            method: 'PATCH',
            headers: { 'content-type': 'application/json', 'Prefer': 'return=representation' },
            body: JSON.stringify(patch)
        }
    );
    if (!res.ok) throw new Error('Updating record failed (' + res.status + ')');
    const rows = await res.json();
    return rows[0];
}

async function getRow(id) {
    const res = await supabaseFetch('/rest/v1/gallery_images?id=eq.' + encodeURIComponent(id), { method: 'GET' });
    if (!res.ok) throw new Error('Record lookup failed (' + res.status + ')');
    const rows = await res.json();
    if (!rows || !rows.length) throw new Error('Record not found');
    return rows[0];
}

async function deleteRow(id) {
    const res = await supabaseFetch('/rest/v1/gallery_images?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
    if (!res.ok) throw new Error('Deletion failed (' + res.status + ')');
}

async function uploadToStorage(storagePath, file) {
    const res = await supabaseFetch(
        '/storage/v1/object/kd-uploads/' + storagePath,
        {
            method: 'POST',
            headers: {
                'content-type': file.type || 'application/octet-stream',
                'x-upsert': 'true'
            },
            body: file
        }
    );
    if (!res.ok) throw new Error('Storage upload failed (' + res.status + ')');
    return supaUrl() + '/storage/v1/object/public/kd-uploads/' + storagePath;
}

async function deleteFromStorage(storagePath) {
    // storage_path is stored WITHOUT the bucket prefix in the DB
    const objectPath = storagePath.replace(/^kd-uploads\//, '');
    const res = await supabaseFetch(
        '/storage/v1/object/kd-uploads/' + objectPath,
        { method: 'DELETE' }
    );
    // 404 is acceptable: record cleanup should still proceed
    if (!res.ok && res.status !== 404) throw new Error('Storage deletion failed (' + res.status + ')');
}

function publicUrlFromPath(storagePath) {
    const objectPath = storagePath.replace(/^kd-uploads\//, '');
    return supaUrl() + '/storage/v1/object/public/kd-uploads/' + objectPath;
}

export default async function handler(request) {
    if (request.method !== 'POST') {
        return json({ error: 'POST only' }, 405);
    }

    const cfgCheck = missingConfigResponse();
    if (cfgCheck) return cfgCheck;

    const code = request.headers.get('x-admin-code') || '';
    if (!safeEqual(code, adminCode())) {
        return json({ error: 'Invalid access code' }, 401);
    }

    let action = '';
    try {
        const contentType = request.headers.get('content-type') || '';
        let body;
        if (contentType.includes('multipart/form-data')) {
            body = await request.formData();
            action = String(body.get('action') || '');
        } else {
            body = await request.json();
            action = String((body && body.action) || '');
        }

        switch (action) {
            case 'verify':
                return json({ ok: true });

            case 'list': {
                const rows = await listAllRows();
                return json({ rows });
            }

            case 'description': {
                const row = await upsertDescription(body);
                return json({ row });
            }

            case 'update': {
                const patch = {};
                if (typeof body.description === 'string') patch.description = body.description.slice(0, MAX_DESCRIPTION);
                if (body.class_key) patch.class_key = String(body.class_key);
                if (body.subject) patch.subject = String(body.subject).slice(0, 80);
                if (!Object.keys(patch).length) return json({ error: 'Nothing to update' }, 400);
                const row = await setBasicFields(body.id, patch);
                return json({ row });
            }

            case 'upload': {
                const file = body.get('file');
                const classKey = String(body.get('class_key') || '');
                const subject = String(body.get('subject') || '').slice(0, 80);
                if (!file || !file.name) return json({ error: 'No file received' }, 400);
                const cleanName = file.name.replace(/[^\w.()\- ]+/g, '').trim();
                const ext = (cleanName.split('.').pop() || '').toLowerCase();
                if (!ALLOWED_UPLOAD_EXT.includes(ext)) {
                    return json({ error: 'Unsupported file type: ' + ext }, 400);
                }
                if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
                    return json({ error: 'File must be between 1 byte and 8 MB' }, 400);
                }
                if (!['class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8', 'class-9', 'class-10'].includes(classKey)) {
                    return json({ error: 'Invalid class' }, 400);
                }
                if (!subject) return json({ error: 'Missing subject' }, 400);

                const base = cleanName.replace(/\.[^.]+$/, '').replace(/\s+/g, '-').slice(0, 60) || 'photo';
                const storagePath = classKey + '/' + Date.now() + '-' + base + '-' + crypto.randomBytes(3).toString('hex') + '.' + ext;
                const publicUrl = await uploadToStorage(storagePath, file);

                const ins = await supabaseFetch('/rest/v1/gallery_images', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json', 'Prefer': 'return=representation' },
                    body: JSON.stringify({
                        class_key: classKey,
                        subject,
                        src: publicUrl,
                        storage_path: storagePath,
                        description: '',
                        published: true
                    })
                });
                if (!ins.ok) throw new Error('Record creation failed (' + ins.status + ')');
                const rows = await ins.json();
                return json({ row: rows[0] });
            }

            case 'replace': {
                const file = body.get('file');
                const id = String(body.get('id') || '');
                if (!file || !id) return json({ error: 'No file or record id' }, 400);
                const row = await getRow(id);
                if (!row.storage_path) {
                    return json({ error: 'This image is an original site asset - it is replaced by updating the site files, then redeploying.' }, 400);
                }
                const cleanName = file.name.replace(/[^\w.()\- ]+/g, '').trim();
                const ext = (cleanName.split('.').pop() || '').toLowerCase();
                if (!ALLOWED_UPLOAD_EXT.includes(ext)) return json({ error: 'Unsupported file type: ' + ext }, 400);
                if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return json({ error: 'File must be between 1 byte and 8 MB' }, 400);

                const objectPath = row.storage_path.replace(/^kd-uploads\//, '');
                const extBefore = (objectPath.split('.').pop() || '').toLowerCase();
                let finalPath = row.storage_path;
                if (ext !== extBefore) {
                    // different format - write next to the old one with new extension
                    finalPath = row.storage_path.replace(/\.[^.]+$/, '.' + ext);
                    await supabaseFetch('/storage/v1/object/kd-uploads/' + objectPath, { method: 'DELETE' });
                }
                await uploadToStorage(finalPath, file);
                // cache-bust the src so all visitors get the updated pixels
                const updated = await setBasicFields(id, {
                    storage_path: finalPath,
                    src: publicUrlFromPath(finalPath) + '?v=' + Date.now()
                });
                return json({ row: updated });
            }

            case 'delete': {
                const id = String((body && body.id) || '');
                if (!id) return json({ error: 'Record id missing' }, 400);
                const row = await getRow(id);
                if (row.storage_path) await deleteFromStorage(row.storage_path);
                await deleteRow(id);
                return json({ ok: true });
            }

            case 'publish': {
                const row = await setBasicFields(body.id, { published: body.published === false ? false : true });
                return json({ row });
            }

            default:
                return json({ error: 'Unknown action: ' + action }, 400);
        }
    } catch (err) {
        return json({ error: String(err && err.message ? err.message : err) }, 500);
    }
}
