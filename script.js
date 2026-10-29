// ==========================================
// DATA
// ==========================================

let kategori = JSON.parse(localStorage.getItem("kategori")) || [
    "Makanan",
    "Minuman"
];

let produk = JSON.parse(localStorage.getItem("produk")) || [{
        kode: "P001",
        nama: "Nasi Goreng",
        kategori: "Makanan",
        harga: 15000,
        stok: 10
    },
    {
        kode: "P002",
        nama: "Mie Goreng",
        kategori: "Makanan",
        harga: 12000,
        stok: 10
    },
    {
        kode: "P003",
        nama: "Ayam Geprek",
        kategori: "Makanan",
        harga: 18000,
        stok: 10
    },
    {
        kode: "P004",
        nama: "Es Teh",
        kategori: "Minuman",
        harga: 5000,
        stok: 15
    },
    {
        kode: "P005",
        nama: "Es Jeruk",
        kategori: "Minuman",
        harga: 7000,
        stok: 15
    }
];

let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];

let keranjang = [];

// User yang sedang login: { username, role }
let userAktif = null;


// ==========================================
// LOGIN & HAK AKSES
// ==========================================
// role "pemilik" : bisa mengakses semua menu
// role "pembeli" : hanya bisa menu Transaksi (membeli)

const usersBawaan = [{
        username: "Abel",
        password: "Abel",
        role: "pemilik"
    },
    {
        username: "Suwono",
        password: "Suwono",
        role: "pembeli"
    },
    {
        username: "rapael",
        password: "rapael",
        role: "pembeli"
    },
    {
        username: "mufti",
        password: "mufti",
        role: "pembeli"
    },
    {
        username: "nadya",
        password: "nadya",
        role: "pembeli"
    }
];

// Akun yang dibuat lewat form "Buat Akun" (disimpan di browser)
let usersTerdaftar = JSON.parse(localStorage.getItem("usersTerdaftar")) || [];

// Gabungan akun bawaan + akun baru
let users = usersBawaan.concat(usersTerdaftar);

// Halaman yang boleh dibuka tiap role
const aksesHalaman = {
    pemilik: ["dashboard", "kategori", "produk", "transaksi", "riwayat", "laporan"],
    pembeli: ["transaksi"]
};

function login() {

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    let user = users.find(function (u) {
        return u.username.toLowerCase() === username.toLowerCase() &&
            u.password === password;
    });

    document.getElementById("loginError").classList.remove("sukses");

    if (!user) {
        document.getElementById("loginError").innerText =
            "Username atau password salah!";
        return;
    }

    masukAplikasi({
        username: user.username,
        role: user.role
    });

    sessionStorage.setItem("userAktif", JSON.stringify(userAktif));
}

// ------------------------------------------
// BUAT AKUN BARU
// ------------------------------------------

function tampilkanRegister() {

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("registerBox").style.display = "block";

    document.getElementById("registerError").innerText = "";
    document.getElementById("registerError").classList.remove("sukses");

    document.getElementById("regUsername").focus();
}

function tampilkanLogin() {

    document.getElementById("registerBox").style.display = "none";
    document.getElementById("loginBox").style.display = "block";

    document.getElementById("regUsername").value = "";
    document.getElementById("regPassword").value = "";
    document.getElementById("regPassword2").value = "";
    document.getElementById("registerError").innerText = "";
}

function daftar() {

    let username = document.getElementById("regUsername").value.trim();
    let password = document.getElementById("regPassword").value.trim();
    let ulangi = document.getElementById("regPassword2").value.trim();

    let pesan = document.getElementById("registerError");

    pesan.classList.remove("sukses");

    if (username === "" || password === "" || ulangi === "") {
        pesan.innerText = "Semua kolom wajib diisi!";
        return;
    }

    if (username.length < 3) {
        pesan.innerText = "Username minimal 3 karakter!";
        return;
    }

    if (password.length < 4) {
        pesan.innerText = "Password minimal 4 karakter!";
        return;
    }

    if (password !== ulangi) {
        pesan.innerText = "Konfirmasi password tidak sama!";
        return;
    }

    let sudahAda = users.some(function (u) {
        return u.username.toLowerCase() === username.toLowerCase();
    });

    if (sudahAda) {
        pesan.innerText = "Username sudah dipakai, pilih yang lain!";
        return;
    }

    // Akun baru selalu berperan sebagai pembeli
    let akunBaru = {
        username: username,
        password: password,
        role: "pembeli"
    };

    usersTerdaftar.push(akunBaru);
    users.push(akunBaru);

    try {
        localStorage.setItem("usersTerdaftar", JSON.stringify(usersTerdaftar));
    } catch (e) {
        pesan.innerText = "Gagal menyimpan akun. Penyimpanan browser penuh!";
        usersTerdaftar.pop();
        users.pop();
        return;
    }

    // Kembali ke halaman login dengan pesan sukses
    tampilkanLogin();

    document.getElementById("username").value = username;
    document.getElementById("password").value = "";

    let info = document.getElementById("loginError");

    info.innerText = "Akun berhasil dibuat! Silakan login.";
    info.classList.add("sukses");

    document.getElementById("password").focus();
}

function masukAplikasi(user) {

    userAktif = user;

    document.getElementById("loginPage").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("loginError").innerText = "";

    document.getElementById("namaUser").innerText = user.username;
    document.getElementById("roleUser").innerText = user.role;

    aturMenuSesuaiRole();

    tampilkanSemua();

    // Halaman awal sesuai role
    showPage(user.role === "pemilik" ? "dashboard" : "transaksi");
}

function aturMenuSesuaiRole() {

    document.querySelectorAll("nav button[data-role]").forEach(function (btn) {

        let khususPemilik = btn.getAttribute("data-role") === "pemilik";

        btn.style.display =
            (khususPemilik && userAktif.role !== "pemilik") ?
            "none" :
            "";
    });
}

function logout() {

    userAktif = null;
    keranjang = [];

    sessionStorage.removeItem("userAktif");

    document.getElementById("app").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginError").innerText = "";
    document.getElementById("loginError").classList.remove("sukses");
    tampilkanLogin();
    document.getElementById("uangBayar").value = "";
    document.getElementById("hasilBayar").innerText = "";

    tutupStruk();
}


// ==========================================
// NAVIGASI
// ==========================================

function showPage(namaPage) {

    if (!userAktif) {
        return;
    }

    // Cegah pembeli membuka halaman milik pemilik
    if (!aksesHalaman[userAktif.role].includes(namaPage)) {
        notif("Anda tidak memiliki akses ke halaman ini!");
        return;
    }

    let pages = document.querySelectorAll(".page");

    pages.forEach(function (page) {
        page.style.display = "none";
    });

    document.getElementById(namaPage).style.display = "block";

    tampilkanSemua();
}

// Pastikan aksi khusus pemilik tidak bisa dipanggil pembeli
function hanyaPemilik() {

    if (!userAktif || userAktif.role !== "pemilik") {
        notif("Hanya pemilik yang dapat melakukan aksi ini!");
        return false;
    }

    return true;
}


// ==========================================
// SIMPAN DATA
// ==========================================

function simpanData() {

    try {
        localStorage.setItem("kategori", JSON.stringify(kategori));
        localStorage.setItem("produk", JSON.stringify(produk));
        localStorage.setItem("transaksi", JSON.stringify(transaksi));
        return true;
    } catch (e) {
        notif("Penyimpanan browser penuh! Gunakan foto yang lebih kecil.");
        return false;
    }
}


// ==========================================
// DIALOG FORM (pengganti prompt)
// ==========================================

let aksiFormSimpan = null;

function bukaForm(judul, fields, onSimpan, labelTombol) {

    let html = "<h3>" + escapeHtml(judul) + "</h3>";

    fields.forEach(function (f, i) {

        html += `
            <label class="form-label" for="formField${i}">
                ${escapeHtml(f.label)}
            </label>
            <input
                class="form-input"
                id="formField${i}"
                type="${f.type || "text"}"
                ${f.type === "file"
                    ? 'accept="image/*"'
                    : 'value="' + escapeHtml(f.value === undefined ? "" : f.value) + '"'}
                ${f.placeholder ? 'placeholder="' + escapeHtml(f.placeholder) + '"' : ""}
            >
        `;
    });

    html += '<p id="formError" class="form-error"></p>';

    document.getElementById("formIsi").innerHTML = html;
    document.getElementById("formSimpanBtn").innerText = labelTombol || "Simpan";

    aksiFormSimpan = function () {

        let values = fields.map(function (f, i) {

            let el = document.getElementById("formField" + i);

            // Input file mengembalikan objek File (atau null)
            return f.type === "file" ? (el.files[0] || null) : el.value;
        });

        let pesan = onSimpan(values);

        // Jika fungsi mengembalikan teks, tampilkan sebagai pesan error
        if (typeof pesan === "string") {
            document.getElementById("formError").innerText = pesan;
            return;
        }

        tutupForm();
    };

    document.getElementById("formModal").style.display = "flex";

    let pertama = document.getElementById("formField0");

    if (pertama) {
        pertama.focus();
    }
}

function submitForm() {

    if (aksiFormSimpan) {
        aksiFormSimpan();
    }
}

function tutupForm() {

    aksiFormSimpan = null;

    document.getElementById("formModal").style.display = "none";
}

// Pengganti confirm(): tampilkan pertanyaan Ya/Batal
function konfirmasi(pertanyaan, onYa, labelTombol) {

    bukaForm(pertanyaan, [], function () {
        onYa();
    }, labelTombol || "Ya");
}

// Pengganti notif(): pesan singkat yang hilang otomatis
let timerNotif = null;

function notif(pesan) {

    let el = document.getElementById("notifBox");

    if (!el) {
        el = document.createElement("div");
        el.id = "notifBox";
        document.body.appendChild(el);
    }

    el.innerText = pesan;
    el.style.display = "block";

    clearTimeout(timerNotif);

    timerNotif = setTimeout(function () {
        el.style.display = "none";
    }, 3500);
}

// ==========================================
// FOTO PRODUK
// ==========================================

// Membaca file gambar, dikecilkan (maks 300px) agar hemat penyimpanan
function bacaGambar(file, selesai) {

    if (!file) {
        selesai(null);
        return;
    }

    if (!file.type.startsWith("image/")) {
        notif("File harus berupa gambar!");
        selesai(undefined);
        return;
    }

    let reader = new FileReader();

    reader.onerror = function () {
        notif("Gagal membaca gambar!");
        selesai(undefined);
    };

    reader.onload = function () {

        let img = new Image();

        img.onerror = function () {
            notif("Gambar tidak dapat dibuka!");
            selesai(undefined);
        };

        img.onload = function () {

            let maks = 300;
            let skala = Math.min(1, maks / Math.max(img.width, img.height));

            let canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * skala);
            canvas.height = Math.round(img.height * skala);

            let ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            selesai(canvas.toDataURL("image/jpeg", 0.75));
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);
}

function tampilFoto(item) {

    if (item.gambar) {
        return '<img class="foto-produk" src="' + item.gambar +
            '" alt="' + escapeHtml(item.nama) + '">';
    }

    return '<div class="foto-kosong">🍽️</div>';
}


// ==========================================
// KATEGORI - CREATE
// ==========================================

function tambahKategori() {

    if (!hanyaPemilik()) return;

    let nama = document.getElementById("namaKategori").value.trim();

    if (nama === "") {
        notif("Nama kategori harus diisi!");
        return;
    }

    if (kategori.includes(nama)) {
        notif("Kategori sudah ada!");
        return;
    }

    kategori.push(nama);

    document.getElementById("namaKategori").value = "";

    simpanData();
    tampilkanKategori();
    isiSelectKategori();

    notif("Kategori berhasil ditambahkan!");
}


// ==========================================
// KATEGORI - READ
// ==========================================

function tampilkanKategori() {

    let tabel = document.getElementById("tabelKategori");

    tabel.innerHTML = "";

    kategori.forEach(function (nama, index) {

        tabel.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${nama}</td>
                <td>
                    <button onclick="editKategori(${index})">Edit</button>
                    <button onclick="hapusKategori(${index})">Hapus</button>
                </td>
            </tr>
        `;
    });

    document.getElementById("totalKategori").innerText = kategori.length;
}


// ==========================================
// KATEGORI - UPDATE
// ==========================================

function editKategori(index) {

    if (!hanyaPemilik()) return;

    let namaLama = kategori[index];

    bukaForm(
        "Edit Kategori",
        [{
            label: "Nama kategori baru",
            value: namaLama
        }],
        function (v) {

            let namaBaru = v[0].trim();

            if (namaBaru === "") {
                return "Nama kategori harus diisi!";
            }

            if (namaBaru !== namaLama && kategori.includes(namaBaru)) {
                return "Kategori sudah ada!";
            }

            // Samakan kategori pada produk yang memakai nama lama
            produk.forEach(function (item) {
                if (item.kategori === namaLama) {
                    item.kategori = namaBaru;
                }
            });

            kategori[index] = namaBaru;

            simpanData();
            tampilkanKategori();
            isiSelectKategori();
            tampilkanProduk();
        }
    );
}


// ==========================================
// KATEGORI - DELETE
// ==========================================

function hapusKategori(index) {

    if (!hanyaPemilik()) return;

    let nama = kategori[index];

    let digunakan = produk.some(function (item) {
        return item.kategori === nama;
    });

    if (digunakan) {
        notif("Kategori tidak bisa dihapus karena masih digunakan produk!");
        return;
    }

    konfirmasi('Hapus kategori "' + nama + '"?', function () {

        kategori.splice(index, 1);

        simpanData();
        tampilkanKategori();
        isiSelectKategori();

        notif("Kategori berhasil dihapus!");
    }, "Ya, Hapus");
}


// ==========================================
// SELECT KATEGORI
// ==========================================

function isiSelectKategori() {

    let select = document.getElementById("kategoriProduk");

    select.innerHTML = "";

    kategori.forEach(function (nama) {

        select.innerHTML += `<option value="${nama}">${nama}</option>`;
    });
}


// ==========================================
// PRODUK - CREATE
// ==========================================

function tambahProduk() {

    if (!hanyaPemilik()) return;

    let kode = document.getElementById("kodeProduk").value.trim();
    let nama = document.getElementById("namaProduk").value.trim();
    let kat = document.getElementById("kategoriProduk").value;
    let harga = Number(document.getElementById("hargaProduk").value);
    let stok = Number(document.getElementById("stokProduk").value);

    if (kode === "" || nama === "" || kat === "" || harga <= 0 || stok < 0) {
        notif("Data produk belum lengkap atau tidak valid!");
        return;
    }

    let kodeAda = produk.some(function (item) {
        return item.kode === kode;
    });

    if (kodeAda) {
        notif("Kode produk sudah digunakan!");
        return;
    }

    let berkas = document.getElementById("gambarProduk").files[0];

    bacaGambar(berkas, function (gambar) {

        // undefined = gambar gagal dibaca, batalkan
        if (gambar === undefined) {
            return;
        }

        let baru = {
            kode: kode,
            nama: nama,
            kategori: kat,
            harga: harga,
            stok: stok
        };

        if (gambar) {
            baru.gambar = gambar;
        }

        produk.push(baru);

        if (!simpanData()) {
            produk.pop();
            return;
        }

        document.getElementById("kodeProduk").value = "";
        document.getElementById("namaProduk").value = "";
        document.getElementById("hargaProduk").value = "";
        document.getElementById("stokProduk").value = "";
        document.getElementById("gambarProduk").value = "";

        tampilkanProduk();
        tampilkanTransaksiProduk();

        notif("Produk berhasil ditambahkan!");
    });
}


// ==========================================
// PRODUK - READ + SEARCH
// ==========================================

function tampilkanProduk() {

    let tabel = document.getElementById("tabelProduk");

    let keyword = document
        .getElementById("cariProduk")
        .value
        .toLowerCase();

    tabel.innerHTML = "";

    produk.forEach(function (item, index) {

        let cocok =
            item.kode.toLowerCase().includes(keyword) ||
            item.nama.toLowerCase().includes(keyword) ||
            item.kategori.toLowerCase().includes(keyword);

        if (cocok) {

            tabel.innerHTML += `
                <tr>
                    <td>${tampilFoto(item)}</td>
                    <td>${item.kode}</td>
                    <td>${item.nama}</td>
                    <td>${item.kategori}</td>
                    <td>${formatRupiah(item.harga)}</td>
                    <td>${item.stok}</td>
                    <td>
                        <button onclick="editProduk(${index})">Edit</button>
                        <button onclick="hapusProduk(${index})">Hapus</button>
                    </td>
                </tr>
            `;
        }
    });

    document.getElementById("totalProduk").innerText = produk.length;
}


// ==========================================
// PRODUK - UPDATE
// ==========================================

function editProduk(index) {

    if (!hanyaPemilik()) return;

    let item = produk[index];

    bukaForm(
        "Edit Produk (" + item.kode + ")",
        [{
                label: "Nama produk",
                value: item.nama
            },
            {
                label: "Harga",
                value: item.harga,
                type: "number"
            },
            {
                label: "Stok",
                value: item.stok,
                type: "number"
            },
            {
                label: "Ganti foto (opsional)",
                type: "file"
            },
            {
                label: "Hapus foto yang ada? Ketik YA (kosongkan jika tidak)",
                value: "",
                placeholder: "YA / kosong"
            }
        ],
        function (v) {

            let nama = v[0].trim();
            let harga = Number(v[1]);
            let stok = Number(v[2]);

            if (nama === "") {
                return "Nama produk harus diisi!";
            }

            if (v[1] === "" || v[2] === "" || isNaN(harga) || isNaN(stok) ||
                harga <= 0 || stok < 0) {
                return "Harga atau stok tidak valid!";
            }

            let hapusFoto = v[4].trim().toUpperCase() === "YA";

            bacaGambar(v[3], function (gambar) {

                if (gambar === undefined) {
                    return;
                }

                let lama = {
                    nama: item.nama,
                    harga: item.harga,
                    stok: item.stok,
                    gambar: item.gambar
                };

                item.nama = nama;
                item.harga = harga;
                item.stok = stok;

                if (gambar) {
                    item.gambar = gambar;
                } else if (hapusFoto) {
                    delete item.gambar;
                }

                if (!simpanData()) {
                    item.nama = lama.nama;
                    item.harga = lama.harga;
                    item.stok = lama.stok;

                    if (lama.gambar) {
                        item.gambar = lama.gambar;
                    } else {
                        delete item.gambar;
                    }

                    return;
                }

                tampilkanProduk();
                tampilkanTransaksiProduk();

                notif("Produk berhasil diubah!");
            });
        }
    );
}


// ==========================================
// PRODUK - DELETE
// ==========================================

function hapusProduk(index) {

    if (!hanyaPemilik()) return;

    konfirmasi('Hapus produk "' + produk[index].nama + '"?', function () {

        produk.splice(index, 1);

        simpanData();
        tampilkanProduk();

        notif("Produk berhasil dihapus!");
    }, "Ya, Hapus");
}


// ==========================================
// TRANSAKSI - TAMPIL PRODUK
// ==========================================

function tampilkanTransaksiProduk() {

    let tabel = document.getElementById("tabelTransaksiProduk");

    tabel.innerHTML = "";

    produk.forEach(function (item, index) {

        tabel.innerHTML += `
            <tr>
                <td>${tampilFoto(item)}</td>
                <td>${item.kode}</td>
                <td>${item.nama}</td>
                <td>${formatRupiah(item.harga)}</td>
                <td>${item.stok}</td>
                <td>
                    <button
                        onclick="tambahKeranjang(${index})"
                        ${item.stok <= 0 ? "disabled" : ""}
                    >
                        ${item.stok <= 0 ? "Stok Habis" : "Tambah"}
                    </button>
                </td>
            </tr>
        `;
    });
}


// ==========================================
// KERANJANG - TAMBAH
// ==========================================

function tambahKeranjang(index) {

    let item = produk[index];

    let ada = keranjang.find(function (x) {
        return x.kode === item.kode;
    });

    if (ada) {

        if (ada.qty >= item.stok) {
            notif("Jumlah melebihi stok!");
            return;
        }

        ada.qty++;

    } else {

        keranjang.push({
            kode: item.kode,
            nama: item.nama,
            harga: item.harga,
            qty: 1
        });
    }

    tampilkanKeranjang();
}


// ==========================================
// KERANJANG - TAMPIL
// ==========================================

function hitungTotalKeranjang() {

    let total = 0;

    keranjang.forEach(function (item) {
        total += item.harga * item.qty;
    });

    return total;
}

function tampilkanKeranjang() {

    let tabel = document.getElementById("tabelKeranjang");

    tabel.innerHTML = "";

    keranjang.forEach(function (item, index) {

        let subtotal = item.harga * item.qty;

        tabel.innerHTML += `
            <tr>
                <td>${item.nama}</td>
                <td>${formatRupiah(item.harga)}</td>
                <td>
                    <button onclick="kurangQty(${index})">-</button>
                    ${item.qty}
                    <button onclick="tambahQty(${index})">+</button>
                </td>
                <td>${formatRupiah(subtotal)}</td>
                <td>
                    <button onclick="hapusKeranjang(${index})">Hapus</button>
                </td>
            </tr>
        `;
    });

    let total = hitungTotalKeranjang();

    document.getElementById("totalKeranjang").innerText = formatRupiah(total);
    document.getElementById("totalBayar").innerText = formatRupiah(total);
}


// ==========================================
// QUANTITY - TAMBAH / KURANG
// ==========================================

function tambahQty(index) {

    let item = keranjang[index];

    let produkAsli = produk.find(function (x) {
        return x.kode === item.kode;
    });

    if (!produkAsli || item.qty >= produkAsli.stok) {
        notif("Quantity tidak boleh melebihi stok!");
        return;
    }

    item.qty++;

    tampilkanKeranjang();
}

function kurangQty(index) {

    if (keranjang[index].qty <= 1) {
        notif("Quantity minimal adalah 1!");
        return;
    }

    keranjang[index].qty--;

    tampilkanKeranjang();
}


// ==========================================
// HAPUS KERANJANG
// ==========================================

function hapusKeranjang(index) {

    keranjang.splice(index, 1);

    tampilkanKeranjang();
}


// ==========================================
// PEMBAYARAN + SIMPAN TRANSAKSI
// ==========================================

function prosesPembayaran() {

    let hasil = document.getElementById("hasilBayar");

    if (keranjang.length === 0) {
        hasil.innerText = "Keranjang masih kosong!";
        return;
    }

    let total = hitungTotalKeranjang();

    let uang = Number(document.getElementById("uangBayar").value);

    if (uang <= 0) {
        hasil.innerText = "Masukkan uang pembayaran.";
        return;
    }

    if (uang < total) {
        hasil.innerText =
            "Uang kurang " + formatRupiah(total - uang);
        return;
    }

    // Validasi stok sebelum menyimpan
    for (let i = 0; i < keranjang.length; i++) {

        let item = keranjang[i];

        let produkAsli = produk.find(function (x) {
            return x.kode === item.kode;
        });

        if (!produkAsli || item.qty > produkAsli.stok) {

            hasil.innerText =
                "Stok " + item.nama + " tidak mencukupi!";
            return;
        }
    }

    let kembalian = uang - total;

    let dataTransaksi = {
        nomor: "TRX" + Date.now(),
        tanggal: new Date().toISOString(),
        pembeli: userAktif ? userAktif.username : "-",
        items: JSON.parse(JSON.stringify(keranjang)),
        total: total,
        bayar: uang,
        kembalian: kembalian
    };

    // Kurangi stok
    keranjang.forEach(function (item) {

        let produkAsli = produk.find(function (x) {
            return x.kode === item.kode;
        });

        produkAsli.stok -= item.qty;
    });

    transaksi.push(dataTransaksi);

    keranjang = [];

    simpanData();

    document.getElementById("uangBayar").value = "";
    hasil.innerText = "";

    tampilkanSemua();

    // Tampilkan bukti transaksi
    tampilkanStruk(dataTransaksi);
}


// ==========================================
// BUKTI TRANSAKSI (STRUK)
// ==========================================

function escapeHtml(teks) {

    return String(teks)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function tampilkanStruk(data) {

    let baris = "";

    data.items.forEach(function (item) {

        baris += `
            <tr>
                <td class="kiri">${escapeHtml(item.nama)}</td>
                <td>${item.qty} x ${formatRupiah(item.harga)}</td>
                <td class="kanan">${formatRupiah(item.harga * item.qty)}</td>
            </tr>
        `;
    });

    document.getElementById("strukIsi").innerHTML = `
        <div class="struk">
            <h3>🍔 Kantin Kampus</h3>
            <p class="struk-sub">BUKTI TRANSAKSI</p>
            <hr>

            <p>No. Transaksi : ${escapeHtml(data.nomor)}</p>
            <p>Tanggal : ${formatTanggal(data.tanggal)}</p>
            <p>Pembeli : ${escapeHtml(data.pembeli || "-")}</p>
            <hr>

            <table class="struk-tabel">
                ${baris}
            </table>
            <hr>

            <table class="struk-tabel">
                <tr>
                    <td class="kiri"><b>Total</b></td>
                    <td class="kanan"><b>${formatRupiah(data.total)}</b></td>
                </tr>
                <tr>
                    <td class="kiri">Bayar</td>
                    <td class="kanan">${formatRupiah(data.bayar || data.total)}</td>
                </tr>
                <tr>
                    <td class="kiri">Kembalian</td>
                    <td class="kanan">${formatRupiah(data.kembalian || 0)}</td>
                </tr>
            </table>
            <hr>

            <p class="struk-sub">Terima kasih atas pembelian Anda!</p>
        </div>
    `;

    document.getElementById("strukModal").style.display = "flex";
}

function lihatStruk(nomor) {

    let data = transaksi.find(function (item) {
        return item.nomor === nomor;
    });

    if (data) {
        tampilkanStruk(data);
    }
}

function tutupStruk() {

    document.getElementById("strukModal").style.display = "none";
}

function cetakStruk() {

    window.print();
}


// ==========================================
// RIWAYAT TRANSAKSI (PEMILIK)
// ==========================================

function tampilkanRiwayat() {

    let tabel = document.getElementById("tabelRiwayat");

    let keyword = document
        .getElementById("cariTransaksi")
        .value
        .toLowerCase();

    let tanggal = document.getElementById("tanggalTransaksi").value;

    tabel.innerHTML = "";

    transaksi.forEach(function (item) {

        let cocokNomor = item.nomor.toLowerCase().includes(keyword);

        let cocokTanggal =
            tanggal === "" ||
            tanggal === tanggalLokal(item.tanggal);

        if (cocokNomor && cocokTanggal) {

            tabel.innerHTML += `
                <tr>
                    <td>${item.nomor}</td>
                    <td>${formatTanggal(item.tanggal)}</td>
                    <td>${escapeHtml(item.pembeli || "-")}</td>
                    <td>${formatRupiah(item.total)}</td>
                    <td>
                        <button onclick="lihatStruk('${item.nomor}')">
                            Lihat Bukti
                        </button>
                    </td>
                </tr>
            `;
        }
    });
}


// ==========================================
// LAPORAN (PEMILIK)
// ==========================================

function tampilkanLaporan() {

    let tabel = document.getElementById("tabelLaporan");
    let tabelPerHari = document.getElementById("tabelPerHari");

    tabel.innerHTML = "";
    tabelPerHari.innerHTML = "";

    let filter = document.getElementById("filterLaporan").value;

    let hariIni = tanggalLokal(new Date().toISOString());
    let bulanIni = hariIni.substring(0, 7);

    let totalHari = 0;
    let totalBulan = 0;
    let totalSemua = 0;

    // Rekap per hari: { "2026-10-22": { jumlah: 3, total: 45000 } }
    let perHari = {};

    transaksi.forEach(function (item) {

        let tanggal = tanggalLokal(item.tanggal);

        totalSemua += item.total;

        if (tanggal === hariIni) {
            totalHari += item.total;
        }

        if (tanggal.substring(0, 7) === bulanIni) {
            totalBulan += item.total;
        }

        if (!perHari[tanggal]) {
            perHari[tanggal] = {
                jumlah: 0,
                total: 0
            };
        }

        perHari[tanggal].jumlah++;
        perHari[tanggal].total += item.total;
    });

    // Tabel pendapatan per hari (terbaru di atas)
    Object.keys(perHari).sort().reverse().forEach(function (tgl) {

        tabelPerHari.innerHTML += `
            <tr>
                <td>${formatTanggalSaja(tgl)}</td>
                <td>${perHari[tgl].jumlah}</td>
                <td>${formatRupiah(perHari[tgl].total)}</td>
                <td>
                    <button onclick="cekHariLaporan('${tgl}')">
                        Lihat Detail
                    </button>
                </td>
            </tr>
        `;
    });

    if (Object.keys(perHari).length === 0) {

        tabelPerHari.innerHTML =
            '<tr><td colspan="4">Belum ada transaksi</td></tr>';
    }

    // Tabel detail (bisa difilter per tanggal)
    let totalFilter = 0;
    let jumlahFilter = 0;

    transaksi.forEach(function (item) {

        let tanggal = tanggalLokal(item.tanggal);

        if (filter !== "" && filter !== tanggal) {
            return;
        }

        totalFilter += item.total;
        jumlahFilter++;

        item.items.forEach(function (produkItem) {

            tabel.innerHTML += `
                <tr>
                    <td>${item.nomor}</td>
                    <td>${formatTanggal(item.tanggal)}</td>
                    <td>${escapeHtml(item.pembeli || "-")}</td>
                    <td>${produkItem.nama}</td>
                    <td>${produkItem.qty}</td>
                    <td>${formatRupiah(produkItem.harga * produkItem.qty)}</td>
                </tr>
            `;
        });
    });

    if (tabel.innerHTML === "") {

        tabel.innerHTML =
            '<tr><td colspan="6">Tidak ada data penjualan</td></tr>';
    }

    document.getElementById("ringkasanFilter").innerText =
        filter === "" ?
        "Menampilkan semua transaksi (" + jumlahFilter + " transaksi)." :
        "Tanggal " + formatTanggalSaja(filter) + ": " +
        jumlahFilter + " transaksi, pendapatan " +
        formatRupiah(totalFilter);

    document.getElementById("laporanHari").innerText = formatRupiah(totalHari);
    document.getElementById("laporanBulan").innerText = formatRupiah(totalBulan);
    document.getElementById("laporanTotal").innerText = formatRupiah(totalSemua);
    document.getElementById("footTotalPerHari").innerText = formatRupiah(totalSemua);
}

function resetPenjualan() {

    if (!hanyaPemilik()) return;

    if (transaksi.length === 0) {
        notif("Belum ada data penjualan untuk direset.");
        return;
    }

    bukaForm(
        "Reset Data Penjualan",
        [{
                label: "Semua riwayat transaksi dan laporan akan dihapus permanen. " +
                    "Ketik RESET untuk melanjutkan:",
                value: "",
                placeholder: "RESET"
            },
            {
                label: "Kembalikan stok produk dari transaksi yang dihapus? " +
                    "Ketik YA (kosongkan jika tidak)",
                value: "",
                placeholder: "YA / kosong"
            }
        ],
        function (v) {

            if (v[0].trim() !== "RESET") {
                return 'Ketik "RESET" (huruf besar) untuk memastikan.';
            }

            if (v[1].trim().toUpperCase() === "YA") {

                transaksi.forEach(function (trx) {
                    trx.items.forEach(function (it) {

                        let p = produk.find(function (x) {
                            return x.kode === it.kode;
                        });

                        if (p) {
                            p.stok += it.qty;
                        }
                    });
                });
            }

            transaksi = [];

            simpanData();

            document.getElementById("filterLaporan").value = "";

            tampilkanSemua();
        },
        "Reset Sekarang"
    );
}

function cekHariLaporan(tanggal) {

    document.getElementById("filterLaporan").value = tanggal;

    tampilkanLaporan();
}

function resetFilterLaporan() {

    document.getElementById("filterLaporan").value = "";

    tampilkanLaporan();
}

function formatTanggalSaja(tanggal) {

    // tanggal berformat YYYY-MM-DD
    let bagian = tanggal.split("-");

    return new Date(bagian[0], bagian[1] - 1, bagian[2])
        .toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}


// ==========================================
// DASHBOARD
// ==========================================

function tampilkanDashboard() {

    document.getElementById("totalProduk").innerText = produk.length;
    document.getElementById("totalKategori").innerText = kategori.length;
    document.getElementById("totalTransaksi").innerText = transaksi.length;

    let total = 0;

    transaksi.forEach(function (item) {
        total += item.total;
    });

    document.getElementById("totalPendapatan").innerText = formatRupiah(total);
}


// ==========================================
// FORMAT
// ==========================================

function formatRupiah(angka) {

    return "Rp" + Number(angka).toLocaleString("id-ID");
}

function formatTanggal(tanggal) {

    return new Date(tanggal).toLocaleString("id-ID");
}

// Tanggal lokal (YYYY-MM-DD) dari string ISO, agar tidak meleset karena zona waktu
function tanggalLokal(iso) {

    let d = new Date(iso);

    let bulan = String(d.getMonth() + 1).padStart(2, "0");
    let hari = String(d.getDate()).padStart(2, "0");

    return d.getFullYear() + "-" + bulan + "-" + hari;
}


// ==========================================
// TAMPILKAN SEMUA DATA
// ==========================================

function tampilkanSemua() {

    tampilkanDashboard();
    tampilkanKategori();
    isiSelectKategori();
    tampilkanProduk();
    tampilkanTransaksiProduk();
    tampilkanKeranjang();
    tampilkanRiwayat();
    tampilkanLaporan();
}


// ==========================================
// PULIHKAN SESI SAAT HALAMAN DIMUAT ULANG
// ==========================================

(function pulihkanSesi() {

    let tersimpan = sessionStorage.getItem("userAktif");

    if (tersimpan) {

        try {
            let sesi = JSON.parse(tersimpan);

            // Ambil role dari daftar user, bukan dari data sesi
            let user = users.find(function (u) {
                return u.username === sesi.username;
            });

            if (user) {
                masukAplikasi({
                    username: user.username,
                    role: user.role
                });
            } else {
                sessionStorage.removeItem("userAktif");
            }
        } catch (e) {
            sessionStorage.removeItem("userAktif");
        }
    }
})();
