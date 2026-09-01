CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  gender TEXT CHECK(gender IN ('Laki-laki','Perempuan')),
  instansi TEXT NOT NULL,
  hp TEXT CHECK(hp GLOB '*[0-9]*' AND length(hp) BETWEEN 8 AND 15),
  email TEXT CHECK(email LIKE '%_@_%._%'),
  pekerjaan TEXT CHECK(pekerjaan IN ('Pelajar/Mahasiswa','Peneliti/Dosen','ASN/TNI/Polri','Pegawai BUMN/BUMD','Pegawai Swasta','Wiraswasta','Lainnya')),
  pekerjaan_lainnya TEXT,
  tahun_lahir INTEGER CHECK(tahun_lahir BETWEEN 1940 AND 2026),
  pendidikan TEXT CHECK(pendidikan IN ('Tidak/Belum Sekolah','SD/Sederajat','SMP/Sederajat','SMA/Sederajat','D1/D2/D3','D4/S1','S2','S3')),
  negara TEXT DEFAULT 'Indonesia',
  provinsi TEXT,
  kab_kota TEXT NOT NULL,
  disabilitas TEXT CHECK(disabilitas IN ('Ya','Tidak')),
  tipe_disabilitas TEXT CHECK(tipe_disabilitas IN ('Fisik','Intelektual','Mental','Sensorik')),
  keperluan TEXT CHECK(keperluan IN ('Kunjungan Perpustakaan','Pembelian Produk Statistik Berbayar','Konsultansi Statistik','Rekomendasi Kegiatan Statistik','Cek Desil DTSEN','Update Data untuk DTSEN','Lainnya')),
  keperluan_lainnya TEXT,
  visit_date TEXT DEFAULT (date('now','localtime')),
  created_at TEXT DEFAULT (datetime('now','localtime')),
  CHECK((pekerjaan!='Lainnya' AND pekerjaan_lainnya IS NULL) OR (pekerjaan='Lainnya' AND pekerjaan_lainnya IS NOT NULL)),
  CHECK((keperluan!='Lainnya' AND keperluan_lainnya IS NULL) OR (keperluan='Lainnya' AND keperluan_lainnya IS NOT NULL)),
  CHECK((disabilitas='Tidak' AND tipe_disabilitas IS NULL) OR (disabilitas='Ya' AND tipe_disabilitas IS NOT NULL)),
  CHECK((negara!='Indonesia' AND provinsi IS NULL) OR (negara='Indonesia' AND provinsi IS NOT NULL))
);

CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_visits_keperluan ON visits(keperluan);
CREATE INDEX idx_visits_created ON visits(created_at DESC);
