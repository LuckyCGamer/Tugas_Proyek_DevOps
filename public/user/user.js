let services = [];

async function init() {
  document.getElementById('hello').textContent = 'Halo, ' + getUser().name;
  try {
    await loadServices();
    await loadOrders();
    await loadProfile();
  } catch (err) { notify(err.message, false); }
}

async function loadServices() {
  services = await api('/user/services');
  document.getElementById('serviceSelect').innerHTML = services
    .map(s => `<option value="${s.id}">${esc(s.name)} - ${rupiah(s.price_per_kg)}/kg</option>`)
    .join('');
  updatePreview();
}

// Pratinjau saja. Total resmi tetap dihitung oleh server.
function updatePreview() {
  const id = Number(document.getElementById('serviceSelect').value);
  const weight = Number(document.getElementById('weight').value) || 0;
  const service = services.find(s => s.id === id);
  const total = service ? weight * Number(service.price_per_kg) : 0;
  document.getElementById('totalPreview').textContent = rupiah(total);
}

async function loadOrders() {
  const orders = await api('/user/orders');
  document.getElementById('orderRows').innerHTML = orders.length
    ? orders.map((o, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${esc(o.service_name)}</td>
          <td>${Number(o.weight)} kg</td>
          <td>${rupiah(o.total_price)}</td>
          <td><span class="badge ${esc(o.status)}">${esc(o.status)}</span></td>
          <td>${formatDate(o.created_at)}</td>
        </tr>`).join('')
    : '<tr><td colspan="6">Belum ada pesanan</td></tr>';
}

async function loadProfile() {
  const p = await api('/user/profile');
  document.getElementById('pName').value = p.name || '';
  document.getElementById('pPhone').value = p.phone || '';
  document.getElementById('pAddress').value = p.address || '';
}

document.getElementById('serviceSelect').addEventListener('change', updatePreview);
document.getElementById('weight').addEventListener('input', updatePreview);

document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await api('/user/orders', 'POST', {
      service_id: Number(document.getElementById('serviceSelect').value),
      weight: Number(document.getElementById('weight').value)
    });
    notify('Pesanan berhasil dibuat. Total: ' + rupiah(res.total_price));
    e.target.reset();
    updatePreview();
    loadOrders();
  } catch (err) { notify(err.message, false); }
});

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const name = document.getElementById('pName').value.trim();
    await api('/user/profile', 'PUT', {
      name,
      phone: document.getElementById('pPhone').value.trim(),
      address: document.getElementById('pAddress').value.trim()
    });
    // perbarui nama di sesi lokal
    const user = getUser();
    user.name = name;
    localStorage.setItem('user', JSON.stringify(user));
    document.getElementById('hello').textContent = 'Halo, ' + name;
    notify('Profil berhasil diperbarui');
  } catch (err) { notify(err.message, false); }
});

if (requireRole('user')) init();