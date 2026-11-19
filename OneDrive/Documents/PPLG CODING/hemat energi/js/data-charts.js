/* ==========================================================================
   PROYEK KOLABORATIF PPLG XI (XI-1 s.d. XI-4)
   KAMPANYE: KONSERVASI DAN PENGHEMATAN ENERGI - FASE 2
   File: js/data-charts.js
   Deskripsi: Visualisasi Data Hasil Kuesioner dengan Chart.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Pastikan DATA_ENERGI tersedia
  if (typeof DATA_ENERGI === 'undefined') {
    console.error('DATA_ENERGI tidak ditemukan! Pastikan data_perilaku_energi.js dimuat sebelum script ini.');
    return;
  }

  const { meta, ringkasan, sebaran_skor_total, per_butir, per_jurusan, per_rombel, per_rayon, per_gaya_belajar } = DATA_ENERGI;

  // Set default Chart.js font to Poppins
  if (window.Chart) {
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.color = '#475569';
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.boxPadding = 6;
  }

  // Objek penyimpan instance chart untuk resize / update
  const charts = {};

  // ==========================================================================
  // 1. CHART DISTRIBUSI KATEGORI (Doughnut Chart)
  // ==========================================================================
  const ctxKategori = document.getElementById('chartKategori');
  if (ctxKategori) {
    const labels = Object.keys(ringkasan.kategori);
    const dataValues = Object.values(ringkasan.kategori);
    const percentValues = Object.values(ringkasan.kategori_persen);

    charts.kategori = new Chart(ctxKategori, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: [
            '#10b981', // Sangat Baik (Emerald)
            '#3b82f6', // Baik (Blue)
            '#f59e0b', // Cukup (Amber)
            '#ef4444'  // Kurang (Red)
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 14,
              padding: 16,
              font: { size: 12, weight: '600' }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const idx = context.dataIndex;
                const count = dataValues[idx];
                const pct = percentValues[idx];
                return ` ${context.label}: ${count} siswa (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // ==========================================================================
  // 2. CHART SEBARAN SKOR TOTAL (Bar Chart Histogram)
  // ==========================================================================
  const ctxSebaran = document.getElementById('chartSebaranSkor');
  if (ctxSebaran) {
    const labels = sebaran_skor_total.map(item => `Skor ${item.skor_total}`);
    const counts = sebaran_skor_total.map(item => item.jumlah);

    charts.sebaran = new Chart(ctxSebaran, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Jumlah Responden',
          data: counts,
          backgroundColor: sebaran_skor_total.map(item => {
            if (item.skor_total === 40) return '#047857'; // Highlight skor sempurna 40
            if (item.skor_total >= 33) return '#10b981';
            if (item.skor_total >= 26) return '#3b82f6';
            return '#f59e0b';
          }),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            title: { display: true, text: 'Jumlah Siswa' }
          },
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.parsed.y} Siswa memperoleh skor ini`
            }
          }
        }
      }
    });
  }

  // ==========================================================================
  // 3. CHART 10 BUTIR PERNYATAAN (Horizontal Bar Chart)
  // ==========================================================================
  const ctxPerButir = document.getElementById('chartPerButir');
  if (ctxPerButir) {
    const labels = per_butir.map(item => `${item.kode}: ${item.label}`);
    const skorRata = per_butir.map(item => item.rata_rata);

    // Warna gradient berdasarkan nilai: hijau tua untuk tertinggi, hijau standar, kuning untuk evaluasi
    const backgroundColors = skorRata.map(val => {
      if (val >= 3.45) return '#059669'; // Tertinggi (P01, P02, P06)
      if (val >= 3.35) return '#10b981'; // Baik
      return '#f59e0b'; // Area Perbaikan (P04, P09, P05, P08)
    });

    charts.perButir = new Chart(ctxPerButir, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Rata-rata Skor (Skala 1 - 4)',
          data: skorRata,
          backgroundColor: backgroundColors,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 2.8,
            max: 4.0,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            title: { display: true, text: 'Rata-rata Skor Likert (1 - 4)' }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: '500' } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const item = per_butir[context.dataIndex];
                return [
                  ` Rata-rata Skor: ${item.rata_rata} / 4.00`,
                  ` Respon Sering/Selalu: ${item.persen_sering}%`,
                  ` Respon Jarang/Pernah: ${item.persen_jarang}%`
                ];
              }
            }
          }
        }
      }
    });
  }

  // ==========================================================================
  // 4. CHART KOMPOSISI SKOR LIKERT (100% Stacked Bar Chart)
  // ==========================================================================
  const ctxBreakdown = document.getElementById('chartButirBreakdown');
  if (ctxBreakdown) {
    const labels = per_butir.map(item => item.kode);
    const skor1 = per_butir.map(item => item.persen_per_skor['1']);
    const skor2 = per_butir.map(item => item.persen_per_skor['2']);
    const skor3 = per_butir.map(item => item.persen_per_skor['3']);
    const skor4 = per_butir.map(item => item.persen_per_skor['4']);

    charts.breakdown = new Chart(ctxBreakdown, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '1 (Sangat Jarang)',
            data: skor1,
            backgroundColor: '#ef4444',
            borderRadius: { topLeft: 4, bottomLeft: 4 }
          },
          {
            label: '2 (Jarang / Kadang)',
            data: skor2,
            backgroundColor: '#f59e0b'
          },
          {
            label: '3 (Sering)',
            data: skor3,
            backgroundColor: '#3b82f6'
          },
          {
            label: '4 (Selalu / Sangat Sering)',
            data: skor4,
            backgroundColor: '#10b981',
            borderRadius: { topRight: 4, bottomRight: 4 }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display: false }
          },
          y: {
            stacked: true,
            max: 100,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            title: { display: true, text: 'Persentase Responden (%)' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, padding: 14 }
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                const item = per_butir[items[0].dataIndex];
                return `${item.kode}: ${item.label}`;
              },
              label: (context) => ` ${context.dataset.label}: ${context.raw}%`
            }
          }
        }
      }
    });
  }

  // ==========================================================================
  // 5. CHART PER JURUSAN (Bar Chart)
  // ==========================================================================
  const ctxJurusan = document.getElementById('chartJurusan');
  if (ctxJurusan) {
    const labels = per_jurusan.map(item => `${item.nama} (${item.kode})`);
    const skorJurusan = per_jurusan.map(item => item.rata_rata_skor);
    const respJurusan = per_jurusan.map(item => item.jumlah_responden);

    charts.jurusan = new Chart(ctxJurusan, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Rata-rata Skor',
          data: skorJurusan,
          backgroundColor: [
            '#047857', // PMN
            '#059669', // HTL
            '#10b981', // KLN
            '#34d399', // TJKT
            '#3b82f6', // DKV
            '#6366f1', // MPLB
            '#f59e0b'  // PPLG
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 3.0,
            max: 3.6,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            title: { display: true, text: 'Rata-rata Skor (1 - 4)' }
          },
          x: {
            grid: { display: false },
            ticks: {
              callback: function(value, index) {
                // Tampilkan kode saja di sumbu X agar rapi
                return per_jurusan[index].kode;
              },
              font: { weight: '600' }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `${per_jurusan[items[0].dataIndex].nama} (${per_jurusan[items[0].dataIndex].kode})`,
              label: (context) => [
                ` Rata-rata Skor: ${context.raw} / 4.00`,
                ` Jumlah Responden: ${respJurusan[context.dataIndex]} siswa`,
                ` Sangat Baik: ${per_jurusan[context.dataIndex].kategori_persen['Sangat Baik']}%`,
                ` Baik: ${per_jurusan[context.dataIndex].kategori_persen['Baik']}%`
              ]
            }
          }
        }
      }
    });
  }

  // ==========================================================================
  // 6. CHART PER RAYON (Bar Chart)
  // ==========================================================================
  const ctxRayon = document.getElementById('chartRayon');
  if (ctxRayon) {
    const labels = per_rayon.map(item => item.rayon);
    const skorRayon = per_rayon.map(item => item.rata_rata_skor);

    charts.rayon = new Chart(ctxRayon, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Rata-rata Skor',
          data: skorRayon,
          backgroundColor: '#0d9488',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 3.2,
            max: 3.5,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            title: { display: true, text: 'Rata-rata Skor' }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => [
                ` Rata-rata Skor: ${context.raw} / 4.00`,
                ` Jumlah Responden: ${per_rayon[context.dataIndex].jumlah_responden} siswa`,
                ` Sangat Baik: ${per_rayon[context.dataIndex].kategori_persen['Sangat Baik']}%`
              ]
            }
          }
        }
      }
    });
  }

  // ==========================================================================
  // 7. CHART GAYA BELAJAR (Bar / Doughnut Chart)
  // ==========================================================================
  const ctxGayaBelajar = document.getElementById('chartGayaBelajar');
  if (ctxGayaBelajar) {
    const labels = per_gaya_belajar.map(item => item.gaya_belajar);
    const skorGaya = per_gaya_belajar.map(item => item.rata_rata_skor);
    const respGaya = per_gaya_belajar.map(item => item.jumlah_responden);

    charts.gayaBelajar = new Chart(ctxGayaBelajar, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Rata-rata Skor',
          data: skorGaya,
          backgroundColor: [
            '#3b82f6', // Visual
            '#8b5cf6', // Auditori
            '#10b981'  // Kinestetik
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 3.2,
            max: 3.5,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            title: { display: true, text: 'Rata-rata Skor' }
          },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => [
                ` Rata-rata Skor: ${context.raw} / 4.00`,
                ` Jumlah Responden: ${respGaya[context.dataIndex]} siswa`,
                ` Sangat Baik: ${per_gaya_belajar[context.dataIndex].kategori_persen['Sangat Baik']}%`
              ]
            }
          }
        }
      }
    });
  }

  // ==========================================================================
  // 8. TAB NAVIGATION INTERACTION
  // ==========================================================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update active button
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active pane
      tabPanes.forEach(pane => {
        if (pane.id === targetTab) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });

      // Trigger resize on charts when pane becomes visible
      setTimeout(() => {
        Object.values(charts).forEach(c => {
          if (c && typeof c.resize === 'function') {
            c.resize();
          }
        });
      }, 50);
    });
  });

  // ==========================================================================
  // 9. INTERACTIVE BUTIR EXPLORER (DETAIL VIEW)
  // ==========================================================================
  const butirListContainer = document.getElementById('butir-selector-list');
  const butirDetailCard = document.getElementById('butir-detail-card');

  if (butirListContainer && butirDetailCard) {
    // Generate list item buttons
    per_butir.forEach((item, index) => {
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = `butir-select-item ${index === 0 ? 'active' : ''}`;
      itemBtn.setAttribute('data-id', item.id);
      itemBtn.innerHTML = `
        <div class="butir-item-header">
          <span class="butir-code">${item.kode}</span>
          <span class="butir-score ${item.rata_rata >= 3.4 ? 'score-high' : 'score-med'}">${item.rata_rata}</span>
        </div>
        <div class="butir-label-short">${item.label}</div>
      `;

      itemBtn.addEventListener('click', () => {
        document.querySelectorAll('.butir-select-item').forEach(b => b.classList.remove('active'));
        itemBtn.classList.add('active');
        renderButirDetail(item);
      });

      butirListContainer.appendChild(itemBtn);
    });

    // Render initial item (P01)
    renderButirDetail(per_butir[0]);
  }

  function renderButirDetail(item) {
    if (!butirDetailCard) return;

    const isHigh = item.rata_rata >= 3.4;
    const badgeText = isHigh ? 'Perilaku Sangat Tinggi 🌟' : 'Peluang Peningkatan 💡';
    const badgeClass = isHigh ? 'badge-high' : 'badge-amber';

    butirDetailCard.innerHTML = `
      <div class="detail-header">
        <div>
          <span class="badge ${badgeClass}">${badgeText}</span>
          <h3 class="detail-title">${item.kode} — ${item.label}</h3>
        </div>
        <div class="detail-score-circle">
          <span class="score-num">${item.rata_rata}</span>
          <span class="score-denom">/ 4.00</span>
        </div>
      </div>

      <div class="detail-question-box">
        <div class="question-label">Isi Pernyataan Kuesioner:</div>
        <p class="question-text">“${item.pertanyaan}”</p>
      </div>

      <div class="detail-stats-grid">
        <div class="detail-stat-card">
          <div class="stat-number text-success">${item.persen_sering}%</div>
          <div class="stat-label">Siswa Sering / Selalu Melakukan</div>
        </div>
        <div class="detail-stat-card">
          <div class="stat-number ${item.persen_jarang > 10 ? 'text-warning' : 'text-muted'}">${item.persen_jarang}%</div>
          <div class="stat-label">Siswa Jarang / Kadang Melakukan</div>
        </div>
        <div class="detail-stat-card">
          <div class="stat-number text-primary">${meta.jumlah_responden}</div>
          <div class="stat-label">Total Responden Menjawab</div>
        </div>
      </div>

      <div class="detail-breakdown-section">
        <h4>Distribusi Pilihan Responden (Skala Likert 1 s.d. 4)</h4>
        
        <div class="likert-bar-group">
          <div class="likert-bar-label">
            <span><strong>Skor 4 (Selalu):</strong> ${item.jumlah_per_skor['4']} siswa</span>
            <span>${item.persen_per_skor['4']}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill fill-green" style="width: ${item.persen_per_skor['4']}%;"></div>
          </div>
        </div>

        <div class="likert-bar-group">
          <div class="likert-bar-label">
            <span><strong>Skor 3 (Sering):</strong> ${item.jumlah_per_skor['3']} siswa</span>
            <span>${item.persen_per_skor['3']}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill fill-blue" style="width: ${item.persen_per_skor['3']}%;"></div>
          </div>
        </div>

        <div class="likert-bar-group">
          <div class="likert-bar-label">
            <span><strong>Skor 2 (Jarang):</strong> ${item.jumlah_per_skor['2']} siswa</span>
            <span>${item.persen_per_skor['2']}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill fill-amber" style="width: ${item.persen_per_skor['2']}%;"></div>
          </div>
        </div>

        <div class="likert-bar-group">
          <div class="likert-bar-label">
            <span><strong>Skor 1 (Sangat Jarang):</strong> ${item.jumlah_per_skor['1']} siswa</span>
            <span>${item.persen_per_skor['1']}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill fill-red" style="width: ${item.persen_per_skor['1']}%;"></div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 10. TABEL PERINGKAT ROMBEL DENGAN SEARCH & FILTER
  // ==========================================================================
  const tableBody = document.getElementById('rombel-table-body');
  const filterJurusan = document.getElementById('filter-jurusan-select');
  const searchRombel = document.getElementById('search-rombel-input');
  const tableCountSpan = document.getElementById('table-count-info');

  if (tableBody) {
    // Siapkan daftar jurusan untuk dropdown filter
    if (filterJurusan) {
      const jurusanList = Array.from(new Set(per_rombel.map(r => r.jurusan))).sort();
      jurusanList.forEach(jur => {
        const opt = document.createElement('option');
        opt.value = jur;
        opt.textContent = `${jur} (${getJurusanFullName(jur)})`;
        filterJurusan.appendChild(opt);
      });
    }

    // Fungsi render tabel
    function renderRombelTable() {
      const selectedJurusan = filterJurusan ? filterJurusan.value : 'ALL';
      const searchKeyword = searchRombel ? searchRombel.value.toLowerCase().trim() : '';

      // Filter rombel
      const filtered = per_rombel.filter(item => {
        const matchJurusan = (selectedJurusan === 'ALL' || item.jurusan === selectedJurusan);
        const matchSearch = item.rombel.toLowerCase().includes(searchKeyword) ||
                            item.jurusan.toLowerCase().includes(searchKeyword);
        return matchJurusan && matchSearch;
      });

      // Clear table
      tableBody.innerHTML = '';

      if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4 text-muted">
              Tidak ada rombel yang sesuai dengan kata kunci pencarian.
            </td>
          </tr>
        `;
        if (tableCountSpan) tableCountSpan.textContent = '0 rombel';
        return;
      }

      if (tableCountSpan) {
        tableCountSpan.textContent = `Menampilkan ${filtered.length} dari ${per_rombel.length} rombel`;
      }

      filtered.forEach((item, idx) => {
        const tr = document.createElement('tr');

        // Medali untuk top 3
        let rankBadge = `<span class="rank-num">${idx + 1}</span>`;
        if (selectedJurusan === 'ALL' && !searchKeyword) {
          if (idx === 0) rankBadge = `<span class="rank-badge rank-1" title="Peringkat 1">🥇 1</span>`;
          else if (idx === 1) rankBadge = `<span class="rank-badge rank-2" title="Peringkat 2">🥈 2</span>`;
          else if (idx === 2) rankBadge = `<span class="rank-badge rank-3" title="Peringkat 3">🥉 3</span>`;
        }

        const scorePercent = ((item.rata_rata_skor / 4.0) * 100).toFixed(1);
        const categoryBadge = item.kategori_persen['Sangat Baik'] >= 60 
          ? `<span class="badge badge-success">Sangat Baik</span>`
          : `<span class="badge badge-blue">Baik</span>`;

        tr.innerHTML = `
          <td class="text-center font-bold">${rankBadge}</td>
          <td>
            <strong>${item.rombel}</strong>
            <div class="rombel-sub">${getJurusanFullName(item.jurusan)}</div>
          </td>
          <td><span class="jurusan-tag">${item.jurusan}</span></td>
          <td class="text-center">${item.jumlah_responden} siswa</td>
          <td>
            <div class="score-cell">
              <strong>${item.rata_rata_skor.toFixed(2)}</strong>
              <div class="score-mini-track">
                <div class="score-mini-fill" style="width: ${scorePercent}%;"></div>
              </div>
            </div>
          </td>
          <td class="text-center font-semibold">${item.rata_rata_total.toFixed(2)}</td>
          <td>${categoryBadge}</td>
        `;

        tableBody.appendChild(tr);
      });
    }

    // Event listeners
    if (filterJurusan) filterJurusan.addEventListener('change', renderRombelTable);
    if (searchRombel) searchRombel.addEventListener('input', renderRombelTable);

    // Initial table render
    renderRombelTable();
  }

  function getJurusanFullName(kode) {
    const found = per_jurusan.find(j => j.kode === kode);
    return found ? found.nama : kode;
  }

  console.log('📊 Dashboard Data & Fakta Fase 2 Siap & Berhasil Diinisialisasi!');
});
