const API = '/api';

function getToken() { return localStorage.getItem('token'); }

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
}

function logout() {
  localStorage.clear();
  location.href = '/login.html';
}

// Memastikan sudah login dengan role yang sesuai
function requireRole(role) {
  const user = getUser();
  if (!getToken() || !user || user.role !== role) {
    location.href = '/login.html';
    return false;
  }
  return true;
}

// Fungsi umum untuk memanggil API
async function api(path, method = 'GET', body = null) {
  const options = { method, headers: {} };
  const token = getToken();
  if (token) options.headers['Authorization'] = 'Bearer ' + token;
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(API + path, options);
  let data = {};
  try { data = await res.json(); } catch (e) {}

  // Token kedaluwarsa atau tidak valid: paksa login ulang
  if (res.status === 401 && token) {
    logout();
    throw new Error('Sesi berakhir, silakan login ulang');
  }
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');
  return data;
}

// Mengubah karakter HTML khusus agar teks tidak dieksekusi sebagai kode
function esc(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function rupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
function formatDate(d) { return new Date(d).toLocaleString('id-ID'); }

// Menampilkan pesan di elemen <div id="msg">
function notify(text, ok = true) {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.className = 'msg ' + (ok ? 'ok' : 'err');
  window.scrollTo(0, 0);
}