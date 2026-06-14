/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
let transactions = [];

// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()
function generateId() {
  return Date.now();
}

/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM
const incomeList = document.getElementById("incomeList");
const expenseList = document.getElementById("expenseList");
console.log(incomeList, expenseList);

/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */
function renderTransactions() {
  incomeList.innerHTML = "";
  expenseList.innerHTML = "";

  for (const transaction of transactions) {
    const card = document.createElement("div");
    card.dataset.testid = "transactionItem";

    const title = document.createElement("h3");
    title.dataset.testid = "transactionItemTitle";
    title.textContent = transaction.title;

    card.appendChild(title);

    const amount = document.createElement("h3");
    amount.dataset.testid = "transactionItemAmount";
    amount.textContent = `Rp ${transaction.amount}`;

    card.appendChild(amount);

    const date = document.createElement("h3");
    date.dataset.testid = "transactionItemDate";
    date.textContent = transaction.date;

    card.appendChild(date);

    const type = document.createElement("h3");
    type.dataset.testid = "transactionItemType";
    type.textContent =
      transaction.type === "income" ? "Pemasukan" : "Pengeluaran";

    card.appendChild(type);

    const editTypeButton = document.createElement("button");
    editTypeButton.dataset.testid = "transactionItemEditTypeButton";
    editTypeButton.textContent = "Edit Type";

    card.appendChild(editTypeButton);

    const deleteButton = document.createElement("button");
    deleteButton.dataset.testid = "transactionItemDeleteButton";
    deleteButton.textContent = "Delete";

    card.appendChild(deleteButton);

    deleteButton.addEventListener("click", () => {
      deleteTransaction(transaction.id);
    });

    if (transaction.type === "income") {
      incomeList.appendChild(card);
    } else {
      expenseList.appendChild(card);
    }
  }
}

// TODO [Basic] Tambahkan event listener 'submit' pada form, panggil e.preventDefault() di dalamnya
const transactionForm = document.getElementById("transactionForm");
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // TODO [Basic] Di dalam handler submit, ambil nilai input lalu tambahkan sebagai objek transaksi baru ke array
  const title = document.getElementById("transactionFormTitleInput").value;
  const amount = document.getElementById("transactionFormAmountInput").value;
  const date = document.getElementById("transactionFormDateInput").value;
  const type = document.getElementById("transactionFormTypeSelect").value;

  /**
   * TODO [Skilled]:
   * Tambahkan validasi input sebelum menyimpan data:
   *  - Tampilkan alert() dan hentikan proses jika judul kosong
   *  - Tampilkan alert() dan hentikan proses jika nominal kurang dari 1
   */
  if (title.trim() === "") {
    alert("Judul tidak boleh kosong");
    return;
  }

  if (Number(amount) < 1) {
    alert("Nominal harus lebih dari 0");
    return;
  }

  const newTransaction = {
    id: generateId(),
    title,
    amount: Number(amount),
    date,
    type,
  };

  transactions.push(newTransaction);
  saveToLocalStorage();
  renderTransactions();
  updateDashboard();
});

/**
 * TODO [Advanced]:
 * Setiap kali data transaksi berubah, perbarui Panel Dasbor:
 *  - Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
 *  - Tampilkan hasilnya ke elemen yang sesuai di HTML
 */

const balanceElement = document.querySelector(
  ".tracker-summary__balance-amount",
);
const incomeElement = document.querySelector(
  ".tracker-summary__stat-amount--income",
);
const expenseElement = document.querySelector(
  ".tracker-summary__stat-amount--expense",
);

function updateDashboard() {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const transaction of transactions) {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  }

  const balance = totalIncome - totalExpense;

  balanceElement.textContent = `Rp ${balance}`;
  incomeElement.textContent = `Rp ${totalIncome}`;
  expenseElement.textContent = `Rp ${totalExpense}`;
}

/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Data transaksi disimpan ke localStorage menggunakan JSON.stringify(), dan dimuat kembali saat halaman dibuka menggunakan JSON.parse().
 *  - Tombol "Hapus" berfungsi: transaksi yang dihapus langsung hilang dari layar dan dari localStorage.
 */
function saveToLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem("transactions");

  if (data) {
    transactions = JSON.parse(data);
  }
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);

  saveToLocalStorage();
  renderTransactions();
  updateDashboard();
}

/**
 * TODO [Skilled]:
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara otomatis terisi dengan data transaksi yang dipilih.
 *  - Pengguna dapat mengubah data lalu menyimpan perubahan.
 *  - Formulir kembali ke mode "Tambah" setelah pembaruan selesai.
 */

/**
 * TODO [Advanced]:
 * Gunakan Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan:
 *  - Kirim sinyal dengan document.dispatchEvent(new Event('transaction:updated')) setiap kali data berubah
 *  - Pasang satu listener untuk event tersebut yang memanggil fungsi render dan update dasbor
 */

/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Tambahkan tombol "Ubah Tipe" pada setiap kartu transaksi:
 *  - Saat diklik, ubah tipe transaksi: 'income' → 'expense' atau 'expense' → 'income'
 *  - Simpan perubahan ke localStorage dan perbarui tampilan
 */

/**
 * TODO [Skilled]:
 * Tambahkan event listener 'input' pada kolom pencarian:
 *  - Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 *  - Tampilkan hanya transaksi yang judulnya mengandung kata kunci tersebut
 */

/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 *  - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 */
loadFromLocalStorage();
renderTransactions();
updateDashboard();
