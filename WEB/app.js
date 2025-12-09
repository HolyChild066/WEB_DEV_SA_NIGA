/* -------------------------
   Simple client-side "backend"
   - Stores rooms and reservations in localStorage
   - Users: hardcoded demo users (student/admin)
   -------------------------*/
const LS_KEY = 'reserve_db_v1';
const USER_KEY = 'reserve_user_v1';

/* Demo seed data */
const demoRooms = [
    { id: 'R101', name: 'AB201', capacity: 60, building: '2nd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R102', name: 'AB202', capacity: 60, building: '2nd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R103', name: 'AB203', capacity: 60, building: '2nd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R104', name: 'AB204', capacity: 60, building: '2nd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R105', name: 'AB205', capacity: 60, building: '2nd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R106', name: 'AB206', capacity: 60, building: '2nd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R107', name: 'AB207', capacity: 60, building: '2nd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R108', name: 'AB208', capacity: 60, building: '2nd floor', features: ['SMART TV', 'Electric Fan'] },
    //3rd floor
    { id: 'R201', name: 'AB301', capacity: 60, building: '3rd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R202', name: 'AB302', capacity: 60, building: '3rd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R203', name: 'AB303', capacity: 60, building: '3rd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R204', name: 'AB304', capacity: 60, building: '3rd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R205', name: 'AB305', capacity: 60, building: '3rd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R206', name: 'AB306', capacity: 60, building: '3rd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R207', name: 'AB307', capacity: 60, building: '3rd floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R208', name: 'AB308', capacity: 60, building: '3rd floor', features: ['SMART TV', 'Electric Fan'] },
    //4th Floor
    { id: 'R301', name: 'AB401', capacity: 60, building: '4th floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R302', name: 'AB402', capacity: 60, building: '4th floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R303', name: 'AB403', capacity: 60, building: '4th floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R304', name: 'AB404', capacity: 60, building: '4th floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R305', name: 'AB405', capacity: 60, building: '4th floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R306', name: 'AB406', capacity: 60, building: '4th floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R307', name: 'AB407', capacity: 60, building: '4th floor', features: ['SMART TV', 'Electric Fan'] },
    { id: 'R308', name: 'AB408', capacity: 60, building: '4th floor', features: ['SMART TV', 'Electric Fan'] },

];

const demoUsers = [
    { username: 'student', password: 'student123', displayName: 'Student User', role: 'user' },
    { username: 'admin', password: 'admin123', displayName: 'Admin', role: 'admin' }
];

function loadDB() {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
    const db = { rooms: demoRooms, reservations: [] };
    localStorage.setItem(LS_KEY, JSON.stringify(db));
    return db;
}
function saveDB(db) { localStorage.setItem(LS_KEY, JSON.stringify(db)); }

function currentUser() { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
function setCurrentUser(u) { if (u) localStorage.setItem(USER_KEY, JSON.stringify(u)); else localStorage.removeItem(USER_KEY); }

/* UI refs */
let roomsContainer, roomSelect, reservationsList, adminList, adminArea, who, loginBtn, logoutBtn,
    loginModal, loginSubmit, loginCancel, usernameInput, passwordInput, filterDate, todayLabel,
    createResBtn, resDate, fromTime, toTime, purpose, buildingFilter, toastWrap;

let db = loadDB();

document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // GRAB DOM REFERENCES FIRST
    // ========================================
    roomsContainer = document.getElementById('roomsContainer');
    roomSelect = document.getElementById('roomSelect');
    reservationsList = document.getElementById('reservationsList');
    adminList = document.getElementById('adminList');
    adminArea = document.getElementById('adminArea');
    who = document.getElementById('who');
    loginBtn = document.getElementById('loginBtn');
    logoutBtn = document.getElementById('logoutBtn');
    loginModal = document.getElementById('loginModal');
    loginSubmit = document.getElementById('loginSubmit');
    loginCancel = document.getElementById('loginCancel');
    usernameInput = document.getElementById('username');
    passwordInput = document.getElementById('password');
    filterDate = document.getElementById('filterDate');
    todayLabel = document.getElementById('todayLabel');
    createResBtn = document.getElementById('createResBtn');
    resDate = document.getElementById('resDate');
    fromTime = document.getElementById('fromTime');
    toTime = document.getElementById('toTime');
    purpose = document.getElementById('purpose');
    buildingFilter = document.getElementById('buildingFilter');
    toastWrap = document.getElementById('toastWrap');

    // ========================================
    // LANDING PAGE FLOW
    // ========================================
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const enterSystemBtn = document.getElementById('enterSystemBtn');

    // Check if user is already logged in
    const user = currentUser();
    if (user) {
        // User is logged in, skip landing page and show main app
        landingPage.classList.add('hidden');
        mainApp.classList.add('visible');
    } else {
        // Show landing page
        landingPage.classList.remove('hidden');
        mainApp.classList.remove('visible');
    }

    // Handle "Enter System" button click
    enterSystemBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    // ========================================
    // INITIALIZE DEFAULTS AND HANDLERS
    // ========================================

    // init defaults and handlers
    const today = new Date().toISOString().slice(0, 10);
    filterDate.value = today;
    resDate.value = today;
    todayLabel.textContent = today;

    if (loginBtn) loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
    if (loginCancel) loginCancel.addEventListener('click', () => loginModal.style.display = 'none');
    if (loginSubmit) loginSubmit.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (createResBtn) createResBtn.addEventListener('click', handleCreateReservation);

    if (filterDate) filterDate.addEventListener('change', renderAll);
    if (buildingFilter) buildingFilter.addEventListener('change', renderAll);

    document.addEventListener('click', globalClickHandler);

    // Room Modal Handlers
    const closeRoomModal = document.getElementById('roomModalClose');
    if (closeRoomModal) {
        closeRoomModal.addEventListener('click', () => {
            document.getElementById('roomModal').style.display = 'none';
        });
    }

    const roomModalReserve = document.getElementById('roomModalReserve');
    if (roomModalReserve) {
        roomModalReserve.addEventListener('click', () => {
            const id = roomModalReserve.dataset.room;
            if (id) {
                document.getElementById('roomModal').style.display = 'none';
                selectRoomForReservation(id);
            }
        });
    }

    renderAll();

    // Check for auto-signin
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signin') === 'true' && !currentUser()) {
        loginModal.style.display = 'flex';
    }
});

/* Utilities */
function toast(msg, short = false) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(() => el.style.opacity = '0', short ? 1200 : 3000);
    setTimeout(() => el.remove(), short ? 1700 : 3500);
}
function uid(prefix = 'id') { return prefix + Math.random().toString(36).slice(2, 9); }

/* Render rooms and controls */
function renderRooms() {
    roomsContainer.innerHTML = '';
    const date = filterDate.value;
    const building = buildingFilter.value;
    db.rooms.filter(r => building === 'All' || r.building === building).forEach(room => {
        const available = isRoomAvailable(room.id, date);
        const div = document.createElement('div');
        div.className = 'room';
        div.innerHTML = `
      <div style="display:flex; align-items:center; gap:15px;">
        <div class="legend-dot ${available ? 'success' : 'danger'}" style="width:12px; height:12px;"></div>
        <div>
            <h3>${room.name} <span style="font-weight:400; font-size:14px; color:var(--muted);">(${room.id})</span></h3>
            <div class="meta">${room.building} • Capacity: ${room.capacity} • ${room.features.join(', ')}</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <button class="btn-view" data-room="${room.id}">View Details</button>
        <button class="btn-reserve" data-room="${room.id}">Select Room</button>
      </div>
    `;
        roomsContainer.appendChild(div);
    });
    // Populate roomSelect
    roomSelect.innerHTML = db.rooms.map(r => `<option value="${r.id}">${r.name} (${r.id})</option>`).join('');
}

/* Check availability for a room on a date.
   For demo simplicity, if any APPROVED reservation overlaps the day/time, consider it booked.
*/
function isRoomAvailable(roomId, date) {
    return !db.reservations.some(res => res.roomId === roomId && res.date === date && res.status === 'approved');
}

/* Render reservation list for selected date */
function renderReservations() {
    const date = filterDate.value;
    const items = db.reservations.filter(r => r.date === date);
    if (items.length === 0) {
        reservationsList.innerHTML = '<div class="small muted">No reservations for this date.</div>';
        return;
    }
    reservationsList.innerHTML = '';
    items.sort((a, b) => a.fromTime.localeCompare(b.fromTime)).forEach(r => {
        const isRequester = currentUser() && currentUser().username === r.requester;
        const isAdmin = currentUser() && currentUser().role === 'admin';
        const showFinishBtn = r.status === 'approved' && (isRequester || isAdmin);

        const el = document.createElement('div');
        el.className = 'res-item';
        el.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:600">${roomName(r.roomId)} • ${r.fromTime} → ${r.toTime}</div>
        <div class="small muted">${r.purpose} — by ${r.requesterName} (${r.requester})</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
        <div class="tag ${r.status}">${r.status}</div>
        ${currentUser() && (currentUser().role === 'admin' || currentUser().username === r.requester) ? `<div class="small muted">${r.id}</div>` : ''}
        ${showFinishBtn ? `<button class="btn-finish" data-id="${r.id}">Mark finished</button>` : ''}
      </div>
    `;
        reservationsList.appendChild(el);
    });
}

/* Helper */
function roomName(id) { const r = db.rooms.find(x => x.id === id); return r ? r.name : id; }

/* Create reservation handler */
function handleCreateReservation() {
    const user = currentUser();
    if (!user) { toast('You must sign in to reserve.', false); document.getElementById('loginModal').style.display = 'flex'; return; }
    const roomId = roomSelect.value;
    const date = resDate.value;
    const ft = fromTime.value;
    const tt = toTime.value;
    const purp = purpose.value.trim();

    if (!roomId || !date || !ft || !tt || !purp) { toast('Please fill all fields.', false); return; }
    if (ft >= tt) { toast('From time must be before To time.', false); return; }

    // Check conflicts against approved reservations on same date/time
    const conflict = db.reservations.some(r => r.roomId === roomId && r.date === date && r.status === 'approved' &&
        !(tt <= r.fromTime || ft >= r.toTime) // overlap
    );
    if (conflict) {
        toast('Room has an approved booking that overlaps that time.', false);
        return;
    }
    const res = {
        id: uid('res_'),
        roomId, date, fromTime: ft, toTime: tt, purpose: purp,
        requester: user.username, requesterName: user.displayName,
        status: 'pending', createdAt: new Date().toISOString()
    };
    db.reservations.push(res);
    saveDB(db);
    toast('Reservation sent — waiting admin approval.');
    purpose.value = '';
    renderAll();
}

/* Admin actions: approve/decline */
function renderAdmin() {
    const user = currentUser();
    if (!user || user.role !== 'admin') { adminArea.style.display = 'none'; return; }
    adminArea.style.display = 'block';
    const pending = db.reservations.filter(r => r.status === 'pending').sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (pending.length === 0) {
        adminList.innerHTML = '<div class="small muted">No pending requests</div>';
        return;
    }
    adminList.innerHTML = '';
    pending.forEach(r => {
        const div = document.createElement('div');
        div.className = 'res-item';
        div.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:600">${roomName(r.roomId)} • ${r.date} ${r.fromTime} → ${r.toTime}</div>
        <div class="small muted">${r.purpose} — requested by ${r.requesterName} (${r.requester})</div>
        <div class="small muted">id: ${r.id}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <button class="btn-approve" data-id="${r.id}">Approve</button>
        <button class="btn-decline" data-id="${r.id}" style="background:var(--danger);">Decline</button>
      </div>
    `;
        adminList.appendChild(div);
    });

    // wire up buttons
    adminList.querySelectorAll('.btn-approve').forEach(b => {
        b.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            updateReservationStatus(id, 'approved');
            toast('Reservation approved.');
        });
    });
    adminList.querySelectorAll('.btn-decline').forEach(b => {
        b.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            updateReservationStatus(id, 'declined');
            toast('Reservation declined.');
        });
    });
}

/* Update status */
function updateReservationStatus(id, status) {
    const r = db.reservations.find(x => x.id === id);
    if (!r) return;
    r.status = status;
    r.updatedAt = new Date().toISOString();
    saveDB(db);
    renderAll();
}

function markFinished(id) {
    const r = db.reservations.find(x => x.id === id);
    if (!r) return;
    // Only allow marking finished if it was approved
    if (r.status !== 'approved') {
        toast('Reservation is not in approved state.', true);
        return;
    }
    r.status = 'finished';
    r.finishedAt = new Date().toISOString();
    saveDB(db);
    toast('Marked finished — room is now available for that slot.');
    renderAll();
}

/* Simple login */
function handleLogin() {
    const u = usernameInput.value.trim();
    const p = passwordInput.value;
    const found = demoUsers.find(x => x.username === u && x.password === p);
    if (!found) { toast('Invalid credentials', false); return; }
    setCurrentUser(found);
    loginModal.style.display = 'none';
    usernameInput.value = ''; passwordInput.value = '';

    // Hide landing page and show main app
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    if (landingPage) landingPage.classList.add('hidden');
    if (mainApp) mainApp.classList.add('visible');

    toast(`Signed in as ${found.displayName}`, true);
    renderAll();
}
function handleLogout() {
    setCurrentUser(null);
    toast('Signed out', true);
    renderAll();
}

/* Global click delegation for view/reserve quick buttons */
function globalClickHandler(e) {
    // Handle "Mark finished"
    if (e.target.classList.contains('btn-finish')) {
        const id = e.target.dataset.id;
        const r = db.reservations.find(x => x.id === id);
        const user = currentUser();
        if (!user) { toast('Sign in to mark finished.', false); return; }
        if (user.role !== 'admin' && user.username !== r.requester) {
            toast('Only the requester or an admin can mark this as finished.', false);
            return;
        }
        markFinished(id);
        return;
    }

    // Handle "View Details"
    if (e.target.classList.contains('btn-view')) {
        const id = e.target.dataset.room;
        openRoomModal(id);
        return;
    }

    // Handle "Select Room"
    if (e.target.classList.contains('btn-reserve')) {
        const id = e.target.dataset.room;
        selectRoomForReservation(id);
        return;
    }
}

function openRoomModal(id) {
    const room = db.rooms.find(r => r.id === id);
    if (!room) return;

    document.getElementById('modalRoomName').textContent = room.name;
    document.getElementById('modalRoomInfo').innerHTML = `
        <p><strong>Building:</strong> ${room.building}</p>
        <p><strong>Capacity:</strong> ${room.capacity}</p>
        <p><strong>Features:</strong> ${room.features.join(', ')}</p>
    `;

    // Show schedule for today
    const today = filterDate.value;
    const sched = db.reservations.filter(r => r.roomId === id && r.date === today && r.status === 'approved')
        .sort((a, b) => a.fromTime.localeCompare(b.fromTime));

    const schedContainer = document.getElementById('modalSchedule');
    if (sched.length === 0) {
        schedContainer.innerHTML = '<div class="small muted">No approved reservations today.</div>';
    } else {
        schedContainer.innerHTML = sched.map(r => `
            <div style="font-size:13px; border-bottom:1px solid var(--border); padding:5px 0;">
                <strong>${r.fromTime} - ${r.toTime}</strong>: ${r.purpose}
            </div>
        `).join('');
    }

    document.getElementById('roomModalReserve').dataset.room = id;
    document.getElementById('roomModal').style.display = 'flex';
}

function selectRoomForReservation(id) {
    roomSelect.value = id;
    // Scroll to sidebar form if on mobile or just highlight it
    if (window.innerWidth < 800) {
        document.querySelector('.sidebar').scrollIntoView({ behavior: 'smooth' });
    }
    // Flash the form to indicate selection
    const form = document.querySelector('.reservation-form');
    form.style.transition = 'box-shadow 0.3s';
    form.style.boxShadow = '0 0 0 2px var(--accent)';
    setTimeout(() => form.style.boxShadow = 'none', 1000);
}

/* render everything */
function renderAll() {
    db = loadDB();
    const user = currentUser();
    if (user) { who.textContent = `${user.displayName} (${user.role})`; loginBtn.style.display = 'none'; logoutBtn.style.display = 'inline-block'; }
    else { who.textContent = 'Not signed in'; loginBtn.style.display = 'inline-block'; logoutBtn.style.display = 'none'; }
    renderRooms();
    renderReservations();
    renderAdmin();
}

/* Basic seed: ensure db exists */
(function seedIfNeeded() {
    db = loadDB();
    if (!db.rooms || db.rooms.length === 0) { db.rooms = demoRooms; saveDB(db); }
})();

/* Expose small helpers for debugging in console */
window._reserve = {
    get db() { return loadDB(); },
    save: () => { saveDB(db); renderAll(); }
};