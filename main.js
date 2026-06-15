/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
let transactions = [];
let editId = null;
let currentKeyword = "";

// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}

/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM
const incomeList = document.getElementById("incomeList");
const expenseList = document.getElementById("expenseList");

/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */
function renderTransactions(filterData = transactions) {
  incomeList.innerHTML = "";
  expenseList.innerHTML = "";

  for (const transaction of filterData) {
    const card = document.createElement("div");
    card.dataset.testid = "transactionItem";
    card.className = "tracker-transaction-item";

    const title = document.createElement("h3");
    title.dataset.testid = "transactionItemTitle";
    title.textContent = transaction.title;
    title.className = "tracker-transaction-item__title";

    const amount = document.createElement("h3");
    amount.dataset.testid = "transactionItemAmount";
    amount.className =
      transaction.type === "income"
        ? "tracker-transaction-item__amount tracker-transaction-item__amount--income"
        : "tracker-transaction-item__amount tracker-transaction-item__amount--expense";
    amount.textContent = `Rp ${formatRupiah(transaction.amount)}`;

    const date = document.createElement("h3");
    date.dataset.testid = "transactionItemDate";
    date.className = "tracker-transaction-item__date";
    date.textContent = transaction.date;

    const type = document.createElement("h3");
    type.dataset.testid = "transactionItemType";
    type.style.display = "none";

    type.textContent =
      transaction.type === "income" ? "Pemasukan" : "Pengeluaran";
    card.appendChild(type);

    const detail = document.createElement("div");
    detail.className = "tracker-transaction-item__detail";
    detail.appendChild(title);
    detail.appendChild(date);

    const editTypeButton = document.createElement("button");
    editTypeButton.className =
      "tracker-transaction-item__btn tracker-transaction-item__btn--toggle";
    editTypeButton.dataset.testid = "transactionItemEditTypeButton";
    editTypeButton.textContent =
      transaction.type === "income"
        ? "Ubah ke Pengeluaran"
        : "Ubah ke Pemasukan";

    editTypeButton.addEventListener("click", () => {
      const index = transactions.findIndex((t) => t.id === transaction.id);

      if (index === -1) return;

      transactions[index].type =
        transactions[index].type === "income" ? "expense" : "income";

      document.dispatchEvent(new Event("transaction:updated"));
    });

    const editButton = document.createElement("button");
    editButton.className =
      "tracker-transaction-item__btn tracker-transaction-item__btn--edit";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      document.getElementById("transactionFormTitleInput").value =
        transaction.title;
      document.getElementById("transactionFormAmountInput").value =
        transaction.amount;
      document.getElementById("transactionFormDateInput").value =
        transaction.date;
      document.getElementById("transactionFormTypeSelect").value =
        transaction.type;

      editId = transaction.id;
    });

    const deleteButton = document.createElement("button");
    deleteButton.dataset.testid = "transactionItemDeleteButton";
    deleteButton.className =
      "tracker-transaction-item__btn tracker-transaction-item__btn--delete";
    deleteButton.textContent = "Hapus";

    deleteButton.addEventListener("click", () => {
      const isConfirmed = confirm("Yakin mau hapus transaksi ini?");

      if (!isConfirmed) return;

      transactions = transactions.filter((t) => t.id !== transaction.id);

      localStorage.setItem("transactions", JSON.stringify(transactions));

      renderTransactions();
    });

    const actions = document.createElement("div");
    actions.className = "tracker-transaction-item__actions";

    actions.appendChild(editTypeButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    const right = document.createElement("div");
    right.className = "tracker-transaction-item__right";

    right.appendChild(amount);
    right.appendChild(actions);

    card.appendChild(detail);
    card.appendChild(right);

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
  const amount = Number(
    document.getElementById("transactionFormAmountInput").value,
  );
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

  if (amount < 1) {
    alert("Nominal harus lebih dari 0");
    return;
  }

  if (editId) {
    const index = transactions.findIndex((t) => t.id === editId);

    if (index === -1) return;

    transactions[index] = {
      id: editId,
      title,
      amount,
      date,
      type,
    };

    editId = null;
  } else {
    transactions.push({
      id: generateId(),
      title,
      amount,
      date,
      type,
    });
  }

  document.dispatchEvent(new Event("transaction:updated"));
  transactionForm.reset();
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

  balanceElement.textContent = `Rp ${formatRupiah(balance)}`;
  incomeElement.textContent = `Rp ${formatRupiah(totalIncome)}`;
  expenseElement.textContent = `Rp ${formatRupiah(totalExpense)}`;
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

  document.dispatchEvent(new Event("transaction:updated"));
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

document.addEventListener("transaction:updated", () => {
  saveToLocalStorage();
  applyFilter();
  updateDashboard();
});

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
const searchInput = document.getElementById("searchTransactionFormTitleInput");
searchInput.addEventListener("input", (e) => {
  currentKeyword = e.target.value.toLowerCase();
  applyFilter();
});

function applyFilter() {
  const keyword = currentKeyword.trim().toLowerCase();

  const data = keyword
    ? transactions.filter((t) => t.title.toLowerCase().includes(keyword))
    : transactions;

  renderTransactions(data);
}

/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 *  - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 */

loadFromLocalStorage();
applyFilter();
updateDashboard();
