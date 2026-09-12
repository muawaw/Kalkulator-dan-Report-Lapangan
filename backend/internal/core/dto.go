package core

type LapanganResponse struct {
	ID            string  `json:"id"`
	NamaLapangan  string  `json:"nama_lapangan"`
	HargaLapangan float64 `json:"harga_lapangan"`
	HargaBallboy  float64 `json:"harga_ballboy"`
}

type ReclubResponse struct {
	ID              string  `json:"id"`
	JadwalAtauHari  string  `json:"jadwal_atau_hari"`
	BiayaDaftar     float64 `json:"biaya_daftar"`
	BiayaPerJam     float64 `json:"biaya_per_jam"`
	TotalLamaJadwal float64 `json:"total_lama_jadwal"`
}
