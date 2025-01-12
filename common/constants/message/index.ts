enum Message {
    UNAUTHENTICATED_ERROR = "Akses tidak sesuai",
    NOT_FOUND_ERROR = "Data tidak ditemukan",
    VALIDATION_ERROR = "Terjadi kesalahan validasi",
    DEFAULT_ERROR = "Terjadi kesalahan",
    DEFAULT_ERROR_ENCRYPT = "Terjadi kesalahan enkripsi",
    DEFAULT_SUCCESS = "Permintaan berhasil diproses",
    SUDAH_DIHAPUS = "Sudah dihapus",
    SUDAH_DITUTUP = "Sudah ditutup",
    SUDAH_KADALUARSA = "Sudah kadaluarsa",
    SUDAH_DIPUBLIKASIKAN = "Sudah dipublikasikan",
    BELUM_DIPUBLIKASIKAN = "Belum dipublikasikan",
    MULTIPLE_FILE_ERROR = "File tidak boleh lebih dari satu",
    MAX_FILE_SIZE_ERROR = "File size melebihi 5mb",
    FILE_TYPE_ERROR = "Jenis file tidak sesuai",
}

export default Message