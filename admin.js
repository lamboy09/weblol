// ============================================================
// KAUSHALYA DARSHINI - Hidden Admin Mode (frontend)
// ------------------------------------------------------------
// Activation: 15 consecutive clicks on the developer credit
// (counter resets on interruption), then a discreet access-code
// prompt. The code is verified SERVER-SIDE by /api/admin (the
// frontend never knows the real code - this file only carries
// it in the request header).
// All writes go through the Vercel function; nothing here
// writes to Supabase directly.
// ============================================================

(function () {
	'use strict';

	var REQUIRED_CLICKS = 15;
	var CLICK_RESET_MS = 2500;
	var CODE_SESSION_KEY = 'kd-admin-code';
	var MAX_DESCRIPTION = 2000;

	// Matches the api/admin.js whitelist
	var CLASS_KEYS = ['class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8', 'class-9', 'class-10'];
	var SUBJECT_HINTS = [
		[/math/i, 'Math'],
		[/sci/i, 'Science'],
		[/soc/i, 'Social'],
		[/eng/i, 'English'],
		[/telugu/i, 'Telugu'],
		[/hindi/i, 'Hindi'],
		[/sanskrit/i, 'Sanskrit']
	];

	var state = {
		clickCount: 0,
		idleTimer: null,
		active: false,
		code: sessionStorage.getItem(CODE_SESSION_KEY) || '',
		view: 'images',
		rows: [],
		loadedFromDb: false,
		filters: { classKey: 'all', subject: 'all', search: '', missingOnly: false },
		uploads: []
	};

	var elements = {
		bar: null,
		root: null,
		codePrompt: null,
		confirmBox: null,
		toasts: null
	};

	function classData() {
		var cd = typeof classesData !== 'undefined' && classesData ? classesData : window.KD_CLASSES;
		return cd || {};
	}

	function esc(value) {
		return String(value == null ? '' : value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function decodePath(src) {
		var name = String(src || '').split('?')[0];
		try { name = decodeURIComponent(name); } catch (err) { /* keep raw */ }
		return name.split('/').pop() || name;
	}

	/* ============================================================
	   Activation - click counting
	   ============================================================ */

	function resetCounter() {
		state.clickCount = 0;
		if (state.idleTimer) { clearTimeout(state.idleTimer); state.idleTimer = null; }
	}

	function registerActivationClick() {
		state.clickCount++;
		if (state.idleTimer) clearTimeout(state.idleTimer);
		state.idleTimer = setTimeout(resetCounter, CLICK_RESET_MS);
		if (state.clickCount >= REQUIRED_CLICKS) {
			resetCounter();
			openCodePrompt();
		}
	}

	function initActivation() {
		var card = document.querySelector('.credit-card.primary');
		if (!card) return;
		card.addEventListener('click', registerActivationClick);

		// Any click outside the credit card interrupts the sequence
		document.addEventListener('click', function (e) {
			if (state.active || elements.codePrompt && !elements.codePrompt.hidden) return;
			if (!card.contains(e.target)) resetCounter();
		}, true);
	}

	/* ============================================================
	   API client (in front of the Vercel function)
	   ============================================================ */

	function api(action, payload) {
		var headers = { 'x-admin-code': state.code || '' };
		var body;
		if (payload && typeof FormData !== 'undefined' && payload instanceof FormData) {
			payload.set('action', action);
			body = payload;
		} else {
			headers['content-type'] = 'application/json';
			body = JSON.stringify(Object.assign({ action: action }, payload || {}));
		}
		return fetch('api/admin', { method: 'POST', headers: headers, body: body })
			.then(function (res) {
				return res.json().catch(function () { return null; }).then(function (data) {
					if (!res.ok) {
						return { ok: false, status: res.status, error: (data && data.error) || ('Request failed (' + res.status + ')') };
					}
					if (!data || typeof data !== 'object') {
						return { ok: false, status: res.status, error: 'Admin API is not available on this host' };
					}
					return { ok: true, data: data };
				});
			})
			.catch(function () {
				// Network failure - the local preview has no functions
				return { ok: false, status: 0, error: 'offline' };
			});
	}

	/* ============================================================
	   Toasts + confirm dialog
	   ============================================================ */

	function buildSharedUI() {
		elements.toasts = document.createElement('div');
		elements.toasts.id = 'kdToasts';
		document.body.appendChild(elements.toasts);

		elements.confirmBox = document.createElement('div');
		elements.confirmBox.className = 'kd-confirm';
		elements.confirmBox.hidden = true;
		elements.confirmBox.innerHTML =
			'<div class="kd-confirm-card" role="alertdialog" aria-modal="true">' +
			'<h3 class="kd-confirm-title"></h3>' +
			'<p class="kd-confirm-msg"></p>' +
			'<div class="kd-confirm-actions">' +
			'<button type="button" class="kd-btn kd-btn-ghost" id="kdConfirmCancel">Cancel</button>' +
			'<button type="button" class="kd-btn kd-btn-danger" id="kdConfirmOk">Confirm</button>' +
			'</div></div>';
		document.body.appendChild(elements.confirmBox);

		elements.confirmBox.querySelector('#kdConfirmOk').addEventListener('click', function () { settleConfirm(true); });
		elements.confirmBox.querySelector('#kdConfirmCancel').addEventListener('click', function () { settleConfirm(false); });
	}

	var confirmResolve = null;

	function settleConfirm(value) {
		elements.confirmBox.hidden = true;
		var resolve = confirmResolve;
		confirmResolve = null;
		if (resolve) resolve(value);
	}

	function confirmDialog(opts) {
		elements.confirmBox.querySelector('.kd-confirm-title').textContent = opts.title || 'Are you sure?';
		elements.confirmBox.querySelector('.kd-confirm-msg').textContent = opts.message || '';
		var okBtn = elements.confirmBox.querySelector('#kdConfirmOk');
		okBtn.textContent = opts.confirmLabel || 'Confirm';
		okBtn.className = 'kd-btn ' + (opts.danger ? 'kd-btn-danger' : 'kd-btn-primary');
		elements.confirmBox.hidden = false;
		return new Promise(function (resolve) { confirmResolve = resolve; });
	}

	function toast(message, kind) {
		var el = document.createElement('div');
		el.className = 'kd-toast' + (kind === 'error' ? ' kd-toast-error' : kind === 'success' ? ' kd-toast-success' : '');
		el.textContent = message;
		elements.toasts.appendChild(el);
		setTimeout(function () { el.classList.add('kd-toast-out'); }, 3600);
		setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 4000);
	}

	/* ============================================================
	   Discreet access-code prompt
	   ============================================================ */

	function buildCodePrompt() {
		elements.codePrompt = document.createElement('div');
		elements.codePrompt.className = 'kd-prompt';
		elements.codePrompt.hidden = true;
		elements.codePrompt.innerHTML =
			'<div class="kd-prompt-card">' +
			'<span class="kd-prompt-dot"></span>' +
			'<p class="kd-prompt-title">Restricted area</p>' +
			'<input type="password" id="kdCodeInput" class="kd-code-input" inputmode="numeric" autocomplete="off" aria-label="Access code" maxlength="12">' +
			'<div class="kd-prompt-actions">' +
			'<button type="button" class="kd-btn kd-btn-ghost kd-btn-sm" id="kdCodeCancel">Cancel</button>' +
			'<button type="button" class="kd-btn kd-btn-primary kd-btn-sm" id="kdCodeOk">Unlock</button>' +
			'</div>' +
			'<p class="kd-prompt-error" id="kdCodeError"></p>' +
			'</div>';
		document.body.appendChild(elements.codePrompt);

		elements.codePrompt.querySelector('#kdCodeCancel').addEventListener('click', hideCodePrompt);
		elements.codePrompt.querySelector('#kdCodeOk').addEventListener('click', submitCode);
		elements.codePrompt.querySelector('#kdCodeInput').addEventListener('keydown', function (e) {
			if (e.key === 'Enter') { e.preventDefault(); submitCode(); }
		});
	}

	function openCodePrompt() {
		if (!elements.codePrompt) buildCodePrompt();
		elements.codePrompt.hidden = false;
		var input = elements.codePrompt.querySelector('#kdCodeInput');
		var errorEl = elements.codePrompt.querySelector('#kdCodeError');
		input.value = '';
		errorEl.textContent = '';
		setTimeout(function () { input.focus(); }, 30);
	}

	function hideCodePrompt() {
		if (elements.codePrompt) elements.codePrompt.hidden = true;
	}

	function promptError(message) {
		var promptCard = elements.codePrompt.querySelector('.kd-prompt-card');
		elements.codePrompt.querySelector('#kdCodeError').textContent = message;
		promptCard.classList.remove('kd-shake');
		// restart the shake animation
		void promptCard.offsetWidth;
		promptCard.classList.add('kd-shake');
	}

	function submitCode() {
		var input = elements.codePrompt.querySelector('#kdCodeInput');
		var code = input.value.trim();
		if (!code) { promptError('Enter the access code'); return; }

		var previous = state.code;
		state.code = code;
		api('verify').then(function (res) {
			if (res.ok) {
				saveCode(code);
				hideCodePrompt();
				activateAdmin();
				return;
			}
			state.code = previous;
			if (res.error === 'offline' || res.status === 0) {
				promptError('Admin works on the deployed site (the local preview has no server functions)');
			} else if (res.status === 401) {
				promptError('Incorrect access code');
				input.value = '';
				input.focus();
			} else if (res.status >= 500) {
				promptError('Server not configured: ' + res.error);
			} else {
				promptError(res.error || 'Verification failed');
			}
		});
	}

	function saveCode(code) {
		state.code = code;
		try { sessionStorage.setItem(CODE_SESSION_KEY, code); } catch (err) { /* private mode */ }
	}

	function clearCode() {
		state.code = '';
		try { sessionStorage.removeItem(CODE_SESSION_KEY); } catch (err) { /* ignore */ }
	}

	/* ============================================================
	   Admin mode shell
	   ============================================================ */

	function buildAdminBar() {
		elements.bar = document.createElement('div');
		elements.bar.className = 'kd-admin-bar';
		elements.bar.hidden = true;
		elements.bar.innerHTML =
			'<span class="kd-admin-bar-tag"><i></i>Admin Mode</span>' +
			'<span class="kd-admin-bar-actions">' +
			'<button type="button" class="kd-btn kd-btn-ghost kd-btn-sm" id="kdBarDashboard">Dashboard</button>' +
			'<button type="button" class="kd-btn kd-btn-danger kd-btn-sm" id="kdBarExit">Exit</button>' +
			'</span>';
		document.body.appendChild(elements.bar);
		elements.bar.querySelector('#kdBarDashboard').addEventListener('click', openDashboard);
		elements.bar.querySelector('#kdBarExit').addEventListener('click', exitAdmin);
	}

	function buildDashboard() {
		elements.root = document.createElement('div');
		elements.root.className = 'kd-admin-root';
		elements.root.hidden = true;
		elements.root.innerHTML =
			'<aside class="kd-admin-side">' +
			'  <div class="kd-admin-brand"><strong>KAUSHALYA DARSHINI</strong><span>Admin dashboard</span></div>' +
			'  <nav class="kd-admin-nav">' +
			'    <button type="button" class="kd-nav-item active" data-view="images">Images</button>' +
			'    <button type="button" class="kd-nav-item" data-view="upload">Upload photos</button>' +
			'  </nav>' +
			'  <div class="kd-admin-side-foot">' +
			'    <button type="button" class="kd-btn kd-btn-ghost kd-btn-sm" id="kdSideExit">Exit Admin Mode</button>' +
			'  </div>' +
			'</aside>' +
			'<section class="kd-admin-main">' +
			'  <header class="kd-admin-top">' +
			'    <h1 class="kd-admin-title">Images</h1>' +
			'    <span class="kd-admin-note"></span>' +
			'    <button type="button" class="kd-btn kd-btn-ghost kd-btn-sm" id="kdAdminClose">Close</button>' +
			'  </header>' +
			'  <div class="kd-admin-body"></div>' +
			'</section>';
		document.body.appendChild(elements.root);

		elements.root.querySelectorAll('.kd-nav-item').forEach(function (btn) {
			btn.addEventListener('click', function () { setView(btn.dataset.view); });
		});
		elements.root.querySelector('#kdAdm' + 'inClose').addEventListener('click', closeDashboard);
		elements.root.querySelector('#kdSideExit').addEventListener('click', exitAdmin);
	}

	function activateAdmin() {
		state.active = true;
		if (!elements.bar) buildAdminBar();
		if (!elements.root) buildDashboard();
		elements.bar.hidden = false;
		openDashboard();
		// Fetch the published records, then repaint with the merged data
		loadRows().then(function () {
			if (elements.root && !elements.root.hidden) populateImages();
		});
		toast('Admin Mode activated', 'success');
	}

	function exitAdmin() {
		state.active = false;
		closeDashboard();
		if (elements.bar) elements.bar.hidden = true;
		clearCode();
		toast('Exited Admin Mode');
	}

	function openDashboard() {
		if (elements.bar) elements.bar.hidden = true;
		if (!elements.root) buildDashboard();
		elements.root.hidden = false;
		setView(state.view || 'images');
	}

	function closeDashboard() {
		if (elements.root) elements.root.hidden = true;
		if (elements.bar) elements.bar.hidden = false;
		if (elements.root) {
			// blur the focused control so Escape / Enter do not re-trigger buttons
			var activeTag = document.activeElement;
			if (elements.root.contains(activeTag)) activeTag.blur();
		}
	}

	function setView(view) {
		state.view = view;
		elements.root.querySelectorAll('.kd-nav-item').forEach(function (btn) {
			btn.classList.toggle('active', btn.dataset.view === view);
		});
		var body = elements.root.querySelector('.kd-admin-body');
		body.innerHTML = '';
		if (view === 'upload') {
			renderUploadView(body);
		} else {
			renderImagesView(body);
		}
	}

	/* ============================================================
	   Images view - model helpers
	   ============================================================ */

	function refreshPublicGallery() {
		if (typeof selectClass === 'function') {
			var activeTab = document.querySelector('.class-picker .category-tab.active');
			if (activeTab && activeTab.dataset.classKey) selectClass(activeTab.dataset.classKey);
		}
	}

	function buildRowsFromLocal() {
		var cd = classData();
		var rows = [];
		CLASS_KEYS.forEach(function (key) {
			var items = cd[key] || [];
			items.forEach(function (item) {
				rows.push({
					id: null,
					src: item.src,
					class_key: key,
					subject: item.subject || 'Photos',
					description: item.description || '',
					described: !!((item.description || '').trim()),
					storage: /^https?:\/\//i.test(item.src),
					dbRow: null
				});
			});
		});
		return rows;
	}

	function srcKey(src) {
		return String(src || '').split('?')[0];
	}

	function mergeDbRows(rows, dbRows) {
		dbRows.forEach(function (row) {
			if (!row || !row.src) return;
			var match = null;
			for (var i = 0; i < rows.length; i++) {
				if (srcKey(rows[i].src) === srcKey(row.src)) { match = rows[i]; break; }
			}
			if (match) {
				match.id = row.id;
				match.class_key = row.class_key || match.class_key;
				match.subject = row.subject || match.subject;
				match.description = row.description || '';
				match.described = !!((row.description || '').trim());
				match.storage = !!row.storage_path || match.storage;
				match.dbRow = row;
				// keep the live gallery item aligned with the server's cache-busted URL
				if (row.src && match.src !== row.src) {
					var item = findLocalItem(match);
					if (item) item.src = row.src;
					match.src = row.src;
				}
			} else {
				rows.push({
					id: row.id,
					src: row.src,
					class_key: row.class_key,
					subject: row.subject || 'Photos',
					description: row.description || '',
					described: !!((row.description || '').trim()),
					storage: !!row.storage_path,
					dbRow: row
				});
			}
		});
		return rows;
	}

	function loadRows() {
		state.rows = buildRowsFromLocal();
		return api('list').then(function (res) {
			if (res.ok && res.data && Array.isArray(res.data.rows)) {
				mergeDbRows(state.rows, res.data.rows);
				state.loadedFromDb = true;
			} else if (res.error === 'offline') {
				state.loadedFromDb = false;
			} else if (res.ok === false) {
				state.loadedFromDb = false;
			}
			return state.rows;
		});
	}

	function findLocalItem(row) {
		var cd = classData();
		var items = cd[row.class_key] || [];
		for (var i = 0; i < items.length; i++) {
			if (items[i].src === row.src) return items[i];
		}
		return null;
	}

	/* ============================================================
	   Images view - filter + render
	   ============================================================ */

	function availableSubjects(rows) {
		var set = {};
		rows.forEach(function (row) { if (row.subject) set[row.subject] = true; });
		return Object.keys(set).sort();
	}

	function filteredRows() {
		var search = state.filters.search.toLowerCase();
		return state.rows.filter(function (row) {
			if (state.filters.classKey !== 'all' && row.class_key !== state.filters.classKey) return false;
			if (state.filters.subject !== 'all' && row.subject !== state.filters.subject) return false;
			if (state.filters.missingOnly && row.described) return false;
			if (search) {
				var haystack = (decodePath(row.src) + ' ' + row.subject + ' ' + row.description).toLowerCase();
				if (haystack.indexOf(search) === -1) return false;
			}
			return true;
		});
	}

	function rowHtml(row, index) {
		var badge = row.described
			? '<span class="kd-badge kd-badge-ok">Described</span>'
			: '<span class="kd-badge kd-badge-warn">No description</span>';
		if (row.storage) badge += '<span class="kd-badge kd-badge-info">Upload</span>';

		var classOptions = CLASS_KEYS.map(function (key) {
			return '<option value="' + key + '"' + (row.class_key === key ? ' selected' : '') + '>Class ' + key.split('-')[1] + '</option>';
		}).join('');

		var deleteBtn = row.id
			? '<button type="button" class="kd-btn kd-btn-danger kd-btn-sm" data-act="delete" data-index="' + index + '">Delete</button>'
			: '<button type="button" class="kd-btn kd-btn-ghost kd-btn-sm" data-act="delete" disabled title="Original site assets are deleted by updating the site files">Delete</button>';

		var statusHtml = row._status
			? '<span class="kd-row-status' + (row._statusError ? ' kd-status-error' : '') + '">' + esc(row._status) + '</span>'
			: '';

		return (
			'<article class="kd-row" data-row-index="' + index + '">' +
			'  <button type="button" class="kd-thumb-btn" data-act="preview" data-index="' + index + '" aria-label="Preview">' +
			'    <img class="kd-thumb" src="' + esc(row.src) + '" alt="" loading="lazy" decoding="async">' +
			'  </button>' +
			'  <div class="kd-row-main">' +
			'    <div class="kd-row-head">' +
			'      <span class="kd-row-name">' + esc(decodePath(row.src)) + '</span>' + badge +
			'    </div>' +
			'    <div class="kd-row-fields">' +
			'      <label class="kd-field"><span>Class</span>' +
			'        <select data-field="class_key" data-index="' + index + '">' + classOptions + '</select></label>' +
			'      <label class="kd-field"><span>Subject</span>' +
			'        <input type="text" data-field="subject" data-index="' + index + '" list="kdSubjectList" value="' + esc(row.subject) + '" maxlength="80" placeholder="Subject"></label>' +
			'    </div>' +
			'    <textarea class="kd-row-desc" data-field="description" data-index="' + index + '" rows="2" maxlength="' + MAX_DESCRIPTION + '" placeholder="Write a description for visitors (leave empty to show nothing publicly)">' + esc(row.description) + '</textarea>' +
			'    <div class="kd-row-actions">' +
			'      <button type="button" class="kd-btn kd-btn-primary kd-btn-sm" data-act="save" data-index="' + index + '">Save &amp; publish</button>' +
			'      <button type="button" class="kd-btn kd-btn-ghost kd-btn-sm" data-act="replace" data-index="' + index + '"' + (row.storage ? '' : ' title="Original site assets are replaced by updating the site files, then redeploying"') + '>Replace photo</button>' +
			deleteBtn +
			'      <span class="kd-row-status-wrap">' + statusHtml + '</span>' +
			'    </div>' +
			'    <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-replace-input="' + index + '" hidden>' +
			'  </div>' +
			'</article>'
		);
	}

	function renderImagesView(body) {
		body.innerHTML =
			'<div class="kd-notice" id="kdDbNotice" hidden></div>' +
			'<div class="kd-toolbar">' +
			'  <label class="kd-field"><span>Class</span>' +
			'    <select id="kdFilterClass"><option value="all">All classes</option></select></label>' +
			'  <label class="kd-field"><span>Subject</span>' +
			'    <select id="kdFilterSubject"><option value="all">All subjects</option></select></label>' +
			'  <label class="kd-field kd-field-grow"><span>Search</span>' +
			'    <input type="search" id="kdFilterSearch" placeholder="Filename, subject or text..." value="' + esc(state.filters.search) + '"></label>' +
			'  <label class="kd-check"><input type="checkbox" id="kdFilterMissing"' + (state.filters.missingOnly ? ' checked' : '') + '> Only missing descriptions</label>' +
			'  <button type="button" class="kd-btn kd-btn-ghost kd-btn-sm" id="kdRefresh">Refresh</button>' +
			'</div>' +
			'<p class="kd-count" id="kdCount"></p>' +
			'<datalist id="kdSubjectList"></datalist>' +
			'<div class="kd-rows" id="kdRows"></div>';

		var classSel = body.querySelector('#kdFilterClass');
		CLASS_KEYS.forEach(function (key) {
			var opt = document.createElement('option');
			opt.value = key;
			opt.textContent = 'Class ' + key.split('-')[1];
			if (state.filters.classKey === key) opt.selected = true;
			classSel.appendChild(opt);
		});

		var subjectSel = body.querySelector('#kdFilterSubject');

		function syncSubjectOptions() {
			var subjects = availableSubjects(state.rows);
			subjectSel.innerHTML = '<option value="all">All subjects</option>';
			subjects.forEach(function (subject) {
				var opt = document.createElement('option');
				opt.value = subject;
				opt.textContent = subject;
				if (state.filters.subject === subject) opt.selected = true;
				subjectSel.appendChild(opt);
			});
		}

		var rowsEl = body.querySelector('#kdRows');
		var countEl = body.querySelector('#kdCount');

		function draw() {
			var list = filteredRows();
			rowsEl.innerHTML = list.map(rowHtml).join('');
			var describedCount = state.rows.filter(function (r) { return r.described; }).length;
			countEl.textContent = list.length + ' of ' + state.rows.length + ' images, ' +
				describedCount + ' described';
			var datalist = body.querySelector('#kdSubjectList');
			datalist.innerHTML = availableSubjects(state.rows).map(function (s) {
				return '<option value="' + esc(s) + '">';
			}).join('');

			if (countEl.textContent.indexOf('NaN') !== -1) countEl.textContent = list.length + ' of ' + state.rows.length + ' images, ' + describedCount + ' described';
			rowsEl.querySelectorAll('[data-act]').forEach(function (btn) { bindRowAction(btn, draw); });
			rowsEl.querySelectorAll('.kd-row [data-field]').forEach(function (field) {
				field.addEventListener('input', function () { markDirty(field); });
				field.addEventListener('change', function () { markDirty(field); });
			});
		}

		classSel.addEventListener('change', function () { state.filters.classKey = classSel.value; state.filters.subject = 'all'; syncSubjectOptions(); draw(); });
		subjectSel.addEventListener('change', function () { state.filters.subject = subjectSel.value; draw(); });
		body.querySelector('#kdFilterSearch').addEventListener('input', function (e) {
			state.filters.search = e.target.value;
			draw();
		});
		body.querySelector('#kdFilterMissing').addEventListener('change', function (e) {
			state.filters.missingOnly = e.target.checked;
			draw();
		});
		body.querySelector('#kdRefresh').addEventListener('click', function () {
			loadRows().then(function () { populateImages(); });
		});

		syncSubjectOptions();
		draw();

		if (!state.loadedFromDb) {
			var notice = body.querySelector('#kdDbNotice');
			notice.hidden = false;
			notice.textContent = 'Saved records could not be loaded - showing the site\'s own gallery images. Publishing still requires the deployed server.';
		}
	}

	function populateImages() {
		if (!elements.root) return;
		if (state.view !== 'images') return;
		var body = elements.root.querySelector('.kd-admin-body');
		if (body) renderImagesView(body);
	}

	function markDirty(field) {
		var rowEl = field.closest('.kd-row');
		if (!rowEl) return;
		// clear any saved-status message for this row so only "Unsaved changes" shows
		var row = filteredRows()[parseInt(rowEl.dataset.rowIndex, 10)];
		if (row) { row._status = null; row._statusError = false; }
		if (field.dataset.field === 'description') {
			var rowObj = row;
			if (rowObj && rowObj.description !== field.value) rowObj.description = field.value;
		}
		var statusEl = rowEl.querySelector('.kd-row-status');
		if (statusEl) { statusEl.textContent = 'Unsaved changes'; statusEl.classList.remove('kd-status-error'); }
		rowEl.classList.add('kd-row-dirty');
	}

	function bindRowAction(btn, draw) {
		var act = btn.dataset.act;
		btn.addEventListener('click', function () {
			// Sync textarea/select edits into the model first, whatever the action
			harvestRowEdits();
			var index = parseInt(btn.dataset.index, 10);
			var list = filteredRows();
			var row = list[index];
			if (!row) return;

			if (act === 'preview') {
				var items = list.map(function (r) { return { src: r.src, subject: r.subject, description: r.description }; });
				if (typeof openImageViewer === 'function') openImageViewer(items, index);
				return;
			}
			if (act === 'save') { saveRow(row, btn, draw); return; }
			if (act === 'replace') { startReplace(row, btn.closest('.kd-row'), draw); return; }
			if (act === 'delete') { deleteRow(row, btn, draw); return; }
		});
	}

	function rowStatus(rowEl, text, isError) {
		if (!rowEl) return;
		var row = filteredRows()[parseInt(rowEl.dataset.rowIndex, 10)];
		if (row) { row._status = text; row._statusError = !!isError; }
		var statusEl = rowEl.querySelector('.kd-row-status');
		if (statusEl) {
			statusEl.textContent = text;
			statusEl.classList.toggle('kd-status-error', !!isError);
		}
	}

	function saveRow(row, btn, draw) {
		var rowEl = btn.closest('.kd-row');
		var payload = {
			src: row.src,
			class_key: row.class_key,
			subject: row.subject,
			description: row.description == null ? '' : String(row.description)
		};
		btn.disabled = true;
		rowStatus(rowEl, 'Publishing...');
		api('description', payload).then(function (res) {
			btn.disabled = false;
			if (!res.ok) {
				rowStatus(rowEl, res.error === 'offline'
					? 'Not possible locally - deploy the site first'
					: (res.error || 'Save failed'), true);
				return;
			}
			var savedRow = res.data.row || {};
			row.id = savedRow.id || row.id;
			row.described = !!row.description.trim();
			// Update the live public data in place
			var item = findLocalItem(row);
			if (item) {
				item.description = row.description;
				item.subject = row.subject;
			}
			refreshPublicGallery();
			if (rowEl) {
				rowEl.classList.remove('kd-row-dirty');
				rowStatus(rowEl, (row.description.trim() ? 'Published' : 'Saved (description cleared)'), false);
			}
			toast(row.description.trim() ? 'Description published' : 'Description cleared and published', 'success');
			draw();
		});
	}

	// Note: class/subject edits before Save are read from the rendered fields
	function harvestRowEdits() {
		if (!elements.root) return;
		elements.root.querySelectorAll('.kd-row').forEach(function (rowEl) {
			var index = parseInt(rowEl.dataset.rowIndex, 10);
			var row = filteredRows()[index];
			if (!row) return;
			rowEl.querySelectorAll('[data-field]').forEach(function (field) {
				row[field.dataset.field === 'description' ? 'description' : field.dataset.field] = field.value;
			});
		});
	}

	function startReplace(row, rowEl) {
		if (!row.storage) {
			toast('Original site images are replaced by updating the site files, then redeploying', 'error');
			return;
		}
		var input = rowEl.querySelector('[data-replace-input]');
		if (!input) return;
		input.value = '';
		input.click();
		input.onchange = function () {
			var file = input.files && input.files[0];
			if (!file) return;
			confirmDialog({
				title: 'Replace this photo?',
				message: decodePath(row.src) + ' will be replaced by "' + file.name + '". The existing description is kept.',
				confirmLabel: 'Replace'
			}).then(function (yes) {
				if (yes) replaceRow(row, rowEl, file);
				else input.value = '';
			});
		};
	}

	function replaceRow(row, rowEl, file) {
		rowStatus(rowEl, 'Uploading...');
		var fd = new FormData();
		fd.set('id', row.id);
		fd.set('file', file);
		var oldSrc = row.src; // cache needed: the item in the live gallery is keyed by the old src
		api('replace', fd).then(function (res) {
			if (!res.ok) {
				rowStatus(rowEl, res.error, true);
				toast(res.error, 'error');
				return;
			}
			var updated = res.data.row || {};
			row.src = updated.src || row.src;
			row.storage = true;
			// Repoint the live public gallery item from the OLD src to the new one
			var cd = classData();
			var items = cd[row.class_key] || [];
			for (var i = 0; i < items.length; i++) {
				if (items[i].src === oldSrc) { items[i].src = row.src; break; }
			}
			refreshPublicGallery();
			loadRows().then(function () { populateImages(); });
			rowStatus(rowEl, 'Replaced');
			toast('Photo replaced', 'success');
		});
	}

	function deleteRow(row, btn) {
		if (!row.id) {
			toast('Original site images are deleted by updating the site files, then redeploying', 'error');
			return;
		}
		confirmDialog({
			title: 'Delete this image?',
			message: decodePath(row.src) + ' will be removed from the public gallery permanently.',
			confirmLabel: 'Delete',
			danger: true
		}).then(function (yes) {
			if (!yes) return;
			var rowEl = btn.closest('.kd-row');
			api('delete', { id: row.id }).then(function (res) {
				if (!res.ok) {
					toast(res.error === 'offline' ? 'Not possible locally - deploy the site first' : res.error, 'error');
					return;
				}
				// Remove from the live gallery if it was an upload
				var cd = classData();
				var items = cd[row.class_key] || [];
				for (var i = 0; i < items.length; i++) {
					if (items[i].src === row.src) { items.splice(i, 1); break; }
				}
				refreshPublicGallery();
				loadRows().then(function () { populateImages(); });
				toast('Image deleted', 'success');
			});
		});
	}

	/* ============================================================
	   Upload view
	   ============================================================ */

	function guessSubject(fileName) {
		for (var i = 0; i < SUBJECT_HINTS.length; i++) {
			if (SUBJECT_HINTS[i][0].test(fileName)) return SUBJECT_HINTS[i][1];
		}
		// Fall back to the first word of the filename
		var base = fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
		if (!base) return 'Photos';
		var word = base.split(' ')[0];
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}

	function renderUploadView(body) {
		body.innerHTML =
			'<div class="kd-upload-target">' +
			'  <h2 class="kd-section-title">New photos</h2>' +
			'  <div class="kd-row-fields">' +
			'    <label class="kd-field"><span>Add to class</span>' +
			'      <select id="kdUploadClass"></select></label>' +
			'    <label class="kd-field kd-field-grow"><span>Subject (auto-suggested, editable per photo)</span>' +
			'      <input type="text" id="kdUploadSubject" list="kdSubjectUploadList" value="" maxlength="80" placeholder="Default subject"></label>' +
			'  </div>' +
			'  <label class="kd-drop" for="kdUploadInput">' +
			'    <strong>Choose photos</strong>' +
			'    <span>JPG, JPEG, PNG or WebP - up to 8 MB each</span>' +
			'    <input type="file" id="kdUploadInput" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple hidden>' +
			'  </label>' +
			'  <datalist id="kdSubjectUploadList"></datalist>' +
			'  <div class="kd-upload-list" id="kdUploadList"></div>' +
			'  <div class="kd-upload-actions">' +
			'    <span class="kd-count" id="kdUploadSummary"></span>' +
			'    <button type="button" class="kd-btn kd-btn-primary" id="kdUploadStart" disabled>Upload &amp; publish</button>' +
			'  </div>' +
			'</div>';

		var classSel = body.querySelector('#kdUploadClass');
		var activeKey = (document.querySelector('.class-picker .category-tab.active') || {}).dataset || {};
		var defaultClass = CLASS_KEYS.indexOf(activeKey.classKey) !== -1 ? activeKey.classKey : 'class-10';
		CLASS_KEYS.forEach(function (key) {
			var opt = document.createElement('option');
			opt.value = key;
			opt.textContent = 'Class ' + key.split('-')[1];
			if (key === defaultClass) opt.selected = true;
			classSel.appendChild(opt);
		});

		var subjectInput = body.querySelector('#kdUploadSubject');
		var listEl = body.querySelector('#kdUploadList');
		var fileInput = body.querySelector('#kdUploadInput');
		var summary = body.querySelector('#kdUploadSummary');
		var startBtn = body.querySelector('#kdUploadStart');

		function subjectOptions() {
			var cd = classData();
			var items = cd[classSel.value] || [];
			var set = {};
			items.forEach(function (item) { if (item.subject) set[item.subject] = true; });
			body.querySelector('#kdSubjectUploadList').innerHTML = Object.keys(set).sort().map(function (s) {
				return '<option value="' + esc(s) + '">';
			}).join('');
		}
		subjectOptions();
		classSel.addEventListener('change', subjectOptions);

		fileInput.addEventListener('change', function () {
			if (!fileInput.files || !fileInput.files.length) return;
			var staged = state.uploads;
			Array.prototype.slice.call(fileInput.files).forEach(function (file) { staged.push({ file: file }); });
			fileInput.value = '';
			validateAndDraw();
		});

		function validateAndDraw() {
			var staged = state.uploads;
			listEl.innerHTML = '';
			var activeSubject = subjectInput.value.trim();
			staged.forEach(function (item, i) {
				if (!item.subject) item.subject = activeSubject || guessSubject(item.file.name);
				if (!item.error) {
					if (!/^image\/(jpeg|png|webp)$/i.test(item.file.type) && !/\.(jpe?g|png|webp)$/i.test(item.file.name)) {
						item.error = 'Unsupported type';
					} else if (item.file.size > 8 * 1024 * 1024) {
						item.error = 'Over the 8 MB limit';
					}
				}
				if (!item.src) {
					try { item.src = URL.createObjectURL(item.file); } catch (err) { /* preview only */ }
				}
				var card = document.createElement('div');
				card.className = 'kd-upload-item' + (item.error ? ' kd-upload-item-error' : '');
				card.innerHTML =
					'<img class="kd-upload-preview" alt=""' + (item.src ? ' src="' + esc(item.src) + '"' : '') + '>' +
					'<div class="kd-upload-item-main">' +
					'  <p class="kd-upload-name">' + esc(item.file.name) + '</p>' +
					'  <label class="kd-field"><span>Subject</span>' +
					'    <input type="text" list="kdSubjectUploadList" data-staged-subject="' + i + '" value="' + esc(item.subject || '') + '" maxlength="80"' + (item.error ? ' disabled' : '') + '></label>' +
					'  <span class="kd-upload-status" data-staged-status="' + i + '">' + esc(item.error || item.status || 'Ready') + '</span>' +
					'</div>' +
					'<button type="button" class="kd-upload-remove" data-staged-remove="' + i + '" aria-label="Remove from list">&times;</button>';
				card.querySelector('[data-staged-subject]').addEventListener('input', function (e) {
					staged[i].subject = e.target.value;
				});
				card.querySelector('[data-staged-remove]').addEventListener('click', function () {
					staged.splice(i, 1);
					validateAndDraw();
				});
				listEl.appendChild(card);
			});
			summary.textContent = staged.length + ' photo' + (staged.length === 1 ? '' : 's') + ' ready';
			startBtn.disabled = !staged.some(function (item) { return !item.error; });
		}

		startBtn.addEventListener('click', function () {
			var classKey = classSel.value;
			var staged = state.uploads.filter(function (item) { return !item.error; });
			if (!staged.length) return;

			startBtn.disabled = true;
			startBtn.textContent = 'Uploading...';

			var queue = staged.slice();
			var failed = 0;
			var done = 0;

			function next() {
				var item = queue.shift();
				if (!item) {
					state.uploads = state.uploads.filter(function (u) { return u.error; });
					startBtn.textContent = 'Upload & publish';
					startBtn.disabled = state.uploads.length === 0;
					loadRows().then(function () {
						refreshPublicGallery();
						validateAndDraw();
					});
					summary.textContent = done + ' uploaded' + (failed ? ', ' + failed + ' failed' : '');
					if (done && !failed) toast(done + ' photo' + (done === 1 ? '' : 's') + ' published', 'success');
					else if (failed) toast(failed + ' upload' + (failed === 1 ? '' : 's') + ' failed', 'error');
					return;
				}
				var idx = state.uploads.indexOf(item);
				var statusEl = listEl.querySelector('[data-staged-status="' + idx + '"]');
				if (statusEl) statusEl.textContent = 'Uploading...';

				var fd = new FormData();
				fd.set('class_key', classKey);
				fd.set('subject', item.subject.trim() || 'Photos');
				fd.set('file', item.file);

				api('upload', fd).then(function (res) {
					if (res.ok) {
						done++;
						var cd = classData();
						if (!cd[classKey]) cd[classKey] = [];
						cd[classKey].push({
							src: res.data.row.src,
							subject: res.data.row.subject,
							description: res.data.row.description || ''
						});
						if (statusEl) statusEl.textContent = 'Published';
					} else {
						failed++;
						item.error = res.error === 'offline' ? 'Not possible locally' : (res.error || 'Upload failed');
						if (statusEl) statusEl.textContent = item.error;
					}
					next();
				});
			}
			next();
		});
	}

	/* ============================================================
	   Escape key handling (only when the viewer is not open)
	   ============================================================ */

	document.addEventListener('keydown', function (e) {
		if (e.key !== 'Escape') return;
		var viewerOpen = !!document.getElementById('imageView');
		if (viewerOpen) return; // the viewer owns Escape
		if (elements.confirmBox && !elements.confirmBox.hidden) { settleConfirm(false); return; }
		if (elements.codePrompt && !elements.codePrompt.hidden) { hideCodePrompt(); return; }
		if (state.active && elements.root && !elements.root.hidden) closeDashboard();
	});

	/* ============================================================
	   Boot
	   ============================================================ */

	initActivation();
	buildSharedUI();

	// Exposed for testing/instrumentation only
	window.KD_ADMIN = {
		state: state,
		openDashboard: openDashboard,
		loadRows: loadRows,
		filteredRows: filteredRows
	};
})();
