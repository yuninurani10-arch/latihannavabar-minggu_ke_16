/* ==========================================================================
   PROYEK KOLABORATIF PPLG XI — KAMPANYE HEMAT ENERGI — FASE 3
   File: js/aksi.js
   Deskripsi: Halaman Aksi & Rekomendasi. Semua angka dibaca dari DATA_ENERGI
              (js/data_perilaku_energi.js), jadi ikut berubah kalau data diperbarui.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof DATA_ENERGI === 'undefined') {
    console.error('DATA_ENERGI tidak ditemukan! Pastikan js/data_perilaku_energi.js dimuat sebelum aksi.js.');
    return;
  }

  const { meta, ringkasan, per_butir, per_jurusan } = DATA_ENERGI;

  // ---------- Helper ----------
  const fmt = (n, d = 1) => Number(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
  const byKode = (kode) => per_butir.find(b => b.kode === kode);
  const el = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Simpan/baca localStorage dengan aman (bisa diblokir di mode privat)
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* abaikan */ } }
  };

  // Jurusan dengan rata-rata terendah untuk satu butir (indeks 0-9)
  function jurusanTerendah(idx) {
    return per_jurusan.reduce((min, j) => (j.rata_rata_per_butir[idx] < min.rata_rata_per_butir[idx] ? j : min));
  }

  // ---------- Isi angka meta di teks ----------
  document.querySelectorAll('[data-meta]').forEach(n => {
    const v = meta[n.dataset.meta];
    if (v !== undefined) n.textContent = n.dataset.meta === 'persen_partisipasi' ? fmt(v, 1) : v;
  });
  document.querySelectorAll('[data-ringkasan]').forEach(n => {
    const v = ringkasan[n.dataset.ringkasan];
    if (v !== undefined) n.textContent = fmt(v, 2);
  });

  // ==========================================================================
  // 1. KARTU KESENJANGAN (hero): P01 vs P09
  // ==========================================================================
  const p01 = byKode('P01');
  const p09 = byKode('P09');
  const gapCard = el('gap-card');
  if (gapCard && p01 && p09) {
    gapCard.innerHTML = `
      <div class="gap-side high">
        <div class="gap-num">${fmt(p01.persen_sering)}%</div>
        <div class="gap-label">merasa sadar &amp; rutin hemat energi sehari-hari</div>
      </div>
      <div class="gap-arrow" aria-hidden="true">→</div>
      <div class="gap-side low">
        <div class="gap-num">${fmt(p09.persen_sering)}%</div>
        <div class="gap-label">berani menegur / mengajak teman satu kelas</div>
      </div>`;
  }

  // ==========================================================================
  // 2. BATANG TEMUAN: persen "jarang" per butir, urut terbesar
  // ==========================================================================
  const barsBox = el('bars');
  const urut = [...per_butir].sort((a, b) => b.persen_jarang - a.persen_jarang);
  const maxJarang = Math.max(...urut.map(b => b.persen_jarang));
  const FOKUS = ['P04', 'P05', 'P09', 'P07', 'P08']; // = 5 rekomendasi

  if (barsBox) {
    barsBox.innerHTML = urut.map(b => `
      <div class="bar-row ${FOKUS.includes(b.kode) ? 'focus' : ''}" role="listitem">
        <div class="bar-name"><b>${b.kode}</b>${esc(b.label)}</div>
        <div class="bar-track"><div class="bar-fill" data-w="${(b.persen_jarang / maxJarang * 100).toFixed(1)}"></div></div>
        <div class="bar-val">${fmt(b.persen_jarang)}%</div>
      </div>`).join('');

    // Animasi batang saat terlihat
    const animate = () => barsBox.querySelectorAll('.bar-fill').forEach(f => { f.style.width = f.dataset.w + '%'; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { animate(); obs.disconnect(); }
      }, { threshold: 0.2 }).observe(barsBox);
    } else { animate(); }
  }

  // ==========================================================================
  // 3. LIMA REKOMENDASI (urut dari % "jarang" tertinggi)
  // ==========================================================================
  const REKOMENDASI = [
    {
      kode: 'P04', idx: 3,
      judul: 'Beri “mode hemat” pada laptop & gawai',
      langkah: [
        'Atur layar mati / sleep otomatis maksimal 5 menit; turunkan kecerahan layar.',
        'Tutup aplikasi, tab, dan game yang berjalan di latar belakang.',
        'Di lab: selesai praktik, shutdown — jangan hanya menutup layar.'
      ],
      coba: 'Sebelum bel istirahat, tutup semua aplikasi yang tidak dipakai dan sleep-kan laptopmu.'
    },
    {
      kode: 'P05', idx: 4,
      judul: 'Berangkat & pulang dengan cara yang lebih hemat',
      langkah: [
        'Jarak dekat? Jalan kaki atau bersepeda.',
        'Pilih angkutan umum, atau berangkat bareng teman yang searah (satu rayon).',
        'Ajak satu temanmu mencoba sekali seminggu, lalu tambah sedikit demi sedikit.'
      ],
      coba: 'Minggu ini, pilih satu hari “bebas kendaraan sendiri” untuk perjalanan dekat.'
    },
    {
      kode: 'P09', idx: 8,
      judul: 'Budayakan saling mengingatkan tanpa sungkan',
      langkah: [
        'Pakai kalimat ramah: “Yuk, lampunya dimatikan dulu, kelas lagi kosong.”',
        'Tiap kelas menunjuk “Energy Buddy” piket harian yang berganti tiap hari.',
        'Pasang stiker pengingat di dekat saklar dan stopkontak (bisa dirancang teman DKV).'
      ],
      coba: 'Hari ini, ingatkan satu teman dengan kalimat ramah di atas — satu kali saja sudah cukup.'
    },
    {
      kode: 'P07', idx: 6,
      judul: 'Manfaatkan cahaya matahari dulu',
      langkah: [
        'Buka tirai dan jendela sebelum jam pelajaran dimulai.',
        'Matikan lampu di sisi jendela lebih dulu bila ruangan sudah cukup terang.',
        'Jadikan membuka tirai sebagai tugas piket kelas.'
      ],
      coba: 'Besok pagi, buka tirai dan matikan satu baris lampu dekat jendela.'
    },
    {
      kode: 'P08', idx: 7,
      judul: 'Atur AC & kipas secukupnya',
      langkah: [
        'Nyalakan AC atau kipas hanya saat ruangan benar-benar dipakai.',
        'Pilih suhu AC yang sejuk nyaman, bukan sedingin mungkin.',
        'Pastikan pintu dan jendela tertutup saat AC menyala.'
      ],
      coba: 'Cek remote AC kelasmu hari ini: apakah suhunya terlalu rendah? Naikkan sedikit.'
    }
  ];

  const recGrid = el('rec-grid');
  if (recGrid) {
    recGrid.innerHTML = REKOMENDASI.map((r, i) => {
      const d = byKode(r.kode);
      if (!d) return '';
      const low = jurusanTerendah(r.idx);
      return `
        <article class="rec-card">
          <div class="rec-head">
            <div class="rec-no" aria-hidden="true">${i + 1}</div>
            <h3>${esc(r.judul)}</h3>
          </div>
          <div class="rec-finding">
            <strong>${fmt(d.persen_jarang)}%</strong> siswa jarang melakukannya
            (rata-rata ${fmt(d.rata_rata, 2)}/4). Skor jurusan paling rendah:
            <strong>${esc(low.kode)}</strong> (${fmt(low.rata_rata_per_butir[r.idx], 2)}).
            <div class="rec-quote">${r.kode}: “${esc(d.pertanyaan)}”</div>
          </div>
          <ul class="rec-steps">${r.langkah.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
          <p class="rec-try"><b>Coba hari ini:</b> ${esc(r.coba)}</p>
        </article>`;
    }).join('');
  }

  // ==========================================================================
  // 4. TANTANGAN 7 HARI (tersimpan di localStorage)
  // ==========================================================================
  const MISI = [
    'Cabut semua charger dan steker yang tidak terpakai di rumah.',
    'Sebelum istirahat, matikan lampu / kipas / AC kelas yang kosong.',
    'Atur laptop ke mode hemat dan tutup semua tab yang tak perlu.',
    'Buka tirai & jendela kelas, matikan lampu yang tidak perlu.',
    'Pilih jalan kaki, sepeda, atau angkutan umum untuk satu perjalanan.',
    'Ingatkan satu teman untuk hemat listrik dengan kalimat yang ramah.',
    'Sebelum pulang, pastikan peralatan lab / praktik sudah mati dengan benar.'
  ];
  const KEY_CHALLENGE = 'hemat-energi-tantangan-v1';
  let done = store.get(KEY_CHALLENGE, []);
  if (!Array.isArray(done)) done = [];

  const list = el('challenge-list');
  function renderChallenge() {
    if (!list) return;
    list.innerHTML = MISI.map((m, i) => `
      <li>
        <label class="check-row ${done.includes(i) ? 'done' : ''}">
          <input type="checkbox" data-i="${i}" ${done.includes(i) ? 'checked' : ''}>
          <span><span class="day">Hari ${i + 1}</span><br><span class="task">${esc(m)}</span></span>
        </label>
      </li>`).join('');

    const n = done.length, pct = Math.round(n / MISI.length * 100);
    el('challenge-text').textContent = n === MISI.length ? '🎉 Semua misi selesai — kamu juara hemat energi!' : `${n} dari ${MISI.length} misi selesai`;
    el('challenge-pct').textContent = pct + '%';
    el('challenge-fill').style.width = pct + '%';
    el('challenge-bar').setAttribute('aria-valuenow', n);
  }
  if (list) {
    list.addEventListener('change', (e) => {
      const i = Number(e.target.dataset.i);
      if (Number.isNaN(i)) return;
      done = e.target.checked ? [...new Set([...done, i])] : done.filter(x => x !== i);
      store.set(KEY_CHALLENGE, done);
      renderChallenge();
    });
    el('challenge-reset')?.addEventListener('click', () => { done = []; store.set(KEY_CHALLENGE, done); renderChallenge(); });
    renderChallenge();
  }

  // ==========================================================================
  // 5. KARTU KOMITMEN (hanya tampil di layar, tidak dikirim ke mana pun)
  // ==========================================================================
  const JANJI = [
    'Mencabut charger / steker setelah selesai dipakai',
    'Mematikan lampu, kipas, atau AC saat kelas kosong',
    'Memberi “mode hemat” pada laptop dan menutup aplikasi yang tak perlu',
    'Membuka tirai & jendela agar cahaya matahari dimanfaatkan',
    'Memilih jalan kaki, sepeda, atau angkutan umum untuk jarak dekat',
    'Mengingatkan teman dengan ramah untuk hemat listrik'
  ];
  const opts = el('pledge-options');
  const form = el('pledge-form');
  if (opts && form) {
    opts.innerHTML = JANJI.map((j, i) => `
      <label class="check-row"><input type="checkbox" name="janji" value="${i}"><span class="task">${esc(j)}</span></label>`).join('');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const picked = [...form.querySelectorAll('input[name="janji"]:checked')].map(c => JANJI[Number(c.value)]);
      if (picked.length === 0) {
        alert('Pilih minimal satu janji dulu ya.');
        return;
      }
      const nama = el('pledge-name').value.trim();
      el('pledge-who').textContent = nama ? `${nama} berjanji untuk…` : 'Saya berjanji untuk…';
      el('pledge-list').innerHTML = picked.map(p => `<li>${esc(p)}</li>`).join('');
      el('pledge-date').textContent = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      el('pledge-card').hidden = false;
      el('pledge-empty').hidden = true;
      el('pledge-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Tandai baris yang dicentang
    form.addEventListener('change', (e) => {
      if (e.target.name === 'janji') e.target.closest('.check-row').classList.toggle('done', e.target.checked);
    });
  }

  console.log('🚀 Halaman Fase 3 (Aksi & Rekomendasi) siap!');
});
