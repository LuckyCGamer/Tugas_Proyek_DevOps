let customers = [], services = [], orders = [];
const STATUSES = ['Pending', 'Proses', 'Selesai'];

/* ============ UMUM ============ */

function showTab(name) {
  ['customers', 'services', 'orders'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('hidden', t !== name);
    document.getElementById('btn-' + t).classList.toggle('active', t === name);
  });
}

async function loadAll() {
  try {
    await loadCustomers();
    await loadServices();
    await loadOrders();
  } catch (err) { notify(err.message, false); }
}

/* ============ PELANGGAN ============ */

async function loadCustomers() {
  customers = await api('/admin/customers');
  document.getElementById('customerRows').innerHTML = customers.length
    ? customers.map(c => `
        <tr>
          <td>${c.id}</td><td>${esc(c.name)}</td><td>${esc(c.phone)}</td>
          <td>${esc(c.address)}</td><td>${esc(c.username)}</td>
          <td>
            <button class="small" onclick="editCustomer(${c.id})">Ubah</button>
            <button class="small danger" onclick="deleteCustomer(${c.id})">Hapus</button>
          </td>
        </tr>`).join('')
    : '<tr><td colspan="6">Belum ada pelanggan</td></tr>';
  fillOrderSelects();
}

function editCustomer(id) {
  const c = customers.find(x => x.id === id);
  document.getElementById('customerFormTitle').textContent = 'Ubah Pelanggan';
  document.getElementById('cPasswordLabel').textContent = 'Password (kosongkan jika tidak diganti)';
  document.getElementById('cId').value = c.id;
  document.getElementById('cName').value = c.name || '';
  document.getElementById('cPhone').value = c.phone || '';
  document.getElementById('cAddress').value = c.address || '';
  document.getElementById('cUsername').value = c.username;
  document.getElementById('cPassword').value = '';
  window.scrollTo(0, 0);
}

function resetCustomerForm() {
  document.getElementById('customerForm').reset();
  document.getElementById('cId').value = '';
  document.getElementById('customerFormTitle').textContent = 'Tambah Pelanggan';
  document.getElementById('cPasswordLabel').textContent = 'Password';
}

async function deleteCustomer(id) {
  if (!confirm('Pelanggan beserta seluruh pesanannya akan dihapus. Lanjutkan?')) return;
  try {
    const res = await api('/admin/customers/' + id, 'DELETE');
    notify(res.message);
    await loadCustomers();
    await loadOrders();
  } catch (err) { notify(err.message, false); }
}

document.getElementById('customerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('cId').value;
  const body = {
    name: document.getElementById('cName').value.trim(),
    phone: document.getElementById('cPhone').value.trim(),
    address: document.getElementById('cAddress').value.trim(),
    username: document.getElementById('cUsername').value.trim(),
    password: document.getElementById('cPassword').value
  };
  try {
    if (id) {
      notify((await api('/admin/customers/' + id, 'PUT', body)).message);
    } else {
      notify((await api('/admin/customers', 'POST', body)).message);
    }
    resetCustomerForm();
    await loadCustomers();
    await loadOrders();
  } catch (err) { notify(err.message, false); }
});

/* ============ LAYANAN ============ */

async function loadServices() {
  services = await api('/admin/services');
  document.getElementById('serviceRows').innerHTML = services.length
    ? services.map(s => `
        <tr>
          <td>${s.id}</td><td>${esc(s.name)}</td><td>${rupiah(s.price_per_kg)}</td>
          <td>
            <button class="small" onclick="editService(${s.id})">Ubah</button>
            <button class="small danger" onclick="deleteService(${s.id})">Hapus</button>
          </td>
        </tr>`).join('')
    : '<tr><td colspan="4">Belum ada layanan</td></tr>';
  fillOrderSelects();
}

function editService(id) {
  const s = services.find(x => x.id === id);
  document.getElementById('serviceFormTitle').textContent = 'Ubah Layanan';
  document.getElementById('sId').value = s.id;
  document.getElementById('sName').value = s.name;
  document.getElementById('sPrice').value = Number(s.price_per_kg);
  window.scrollTo(0, 0);
}

function resetServiceForm() {
  document.getElementById('serviceForm').reset();
  document.getElementById('sId').value = '';
  document.getElementById('serviceFormTitle').textContent = 'Tambah Layanan';
}

async function deleteService(id) {
  if (!confirm('Hapus layanan ini?')) return;
  try {
    notify((await api('/admin/services/' + id, 'DELETE')).message);
    await loadServices();
  } catch (err) { notify(err.message, false); } // contoh: 409 jika layanan sudah dipakai
}

document.getElementById('serviceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('sId').value;
  const body = {
    name: document.getElementById('sName').value.trim(),
    price_per_kg: Number(document.getElementById('sPrice').value)
  };
  try {
    if (id) {
      notify((await api('/admin/services/' + id, 'PUT', body)).message);
    } else {
      notify((await api('/admin/services', 'POST', body)).message);
    }
    resetServiceForm();
    await loadServices();
    await loadOrders();
  } catch (err) { notify(err.message, false); }
});

/* ============ PESANAN ============ */

async function loadOrders() {
  orders = await api('/admin/orders');
  document.getElementById('orderRows').innerHTML = orders.length
    ? orders.map(o => `
        <tr>
          <td>${o.id}</td>
          <td>${esc(o.customer_name)}</td>
          <td>${esc(o.service_name)}</td>
          <td>${Number(o.weight)} kg</td>
          <td>${rupiah(o.total_price)}</td>
          <td>
            <select onchange="changeStatus(${o.id}, this.value)">
              ${STATUSES.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </td>
          <td>${formatDate(o.created_at)}</td>
          <td>
            <button class="small" onclick="editOrder(${o.id})">Edit</button>
            <button class="small danger" onclick="deleteOrder(${o.id})">Hapus</button>
          </td>
        </tr>`).join('')
    : '<tr><td colspan="8">Belum ada pesanan</td></tr>';
}

function fillOrderSelects() {
  document.getElementById('oCustomer').innerHTML = customers
    .map(c => `<option value="${c.id}">${esc(c.name)} (${esc(c.username)})</option>`).join('');
  document.getElementById('oService').innerHTML = services
    .map(s => `<option value="${s.id}">${esc(s.name)} - ${rupiah(s.price_per_kg)}/kg</option>`).join('');
}

async function changeStatus(id, status) {
  try {
    notify((await api('/admin/orders/' + id + '/status', 'PUT', { status })).message);
  } catch (err) { notify(err.message, false); }
}

function editOrder(id) {
  const o = orders.find(x => x.id === id);
  document.getElementById('oId').value = o.id;
  document.getElementById('oCustomer').value = o.user_id;
  document.getElementById('oService').value = o.service_id;
  document.getElementById('oWeight').value = Number(o.weight);
  document.getElementById('orderFormCard').classList.remove('hidden');
  window.scrollTo(0, 0);
}

function closeOrderForm() {
  document.getElementById('orderFormCard').classList.add('hidden');
}

async function deleteOrder(id) {
  if (!confirm('Hapus pesanan ini?')) return;
  try {
    notify((await api('/admin/orders/' + id, 'DELETE')).message);
    await loadOrders();
  } catch (err) { notify(err.message, false); }
}

document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('oId').value;
  try {
    const res = await api('/admin/orders/' + id, 'PUT', {
      user_id: Number(document.getElementById('oCustomer').value),
      service_id: Number(document.getElementById('oService').value),
      weight: Number(document.getElementById('oWeight').value)
    });
    notify(res.message + '. Total baru: ' + rupiah(res.total_price));
    closeOrderForm();
    await loadOrders();
  } catch (err) { notify(err.message, false); }
});

/* ============ MULAI ============ */

if (requireRole('admin')) {
  document.getElementById('hello').textContent = 'Halo, ' + getUser().name;
  showTab('customers');
  loadAll();
}