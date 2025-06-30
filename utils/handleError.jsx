import Swal from "sweetalert2";

// Fungsi untuk menampilkan pesan toast dengan SweetAlert2
const ToastError = (title, text, icon = "error") => {
  Swal.fire({
    title,
    text,
    icon,
    position: "top-end", // Menentukan posisi di atas sebelah kanan
    toast: true,
    showConfirmButton: false, // Tidak menampilkan tombol OK
    timer: 5000,
    showCloseButton: true,
    background: "red",
    color: "white",
    // color: "#716add",
    // customClass: {
    //   container: "toast-container",
    //   popup: "colored-toast",
    // },
    timerProgressBar: true,
  });
};

// Fungsi untuk menampilkan pesan error berdasarkan kode status HTTP
const handleHttpError = (status, text) => {
  switch (status) {
    case 400:
      ToastError(`Kesalahan Permintaan, Permintaan tidak valid. (${text})`);
      break;
    case 401:
      ToastError(
        `Tidak Diotorisasi, Anda tidak memiliki izin untuk akses. (${text})`
      );
      break;
    case 403:
      ToastError(`Akses Ditolak, Akses ke sumber daya dilarang. (${text})`);
      break;
    case 404:
      ToastError(`Error Refresh Token. Silahkan Login Ulang... (${text})`);
      break;
    case 429:
      ToastError(
        `Terlalu Banyak Permintaan, Anda telah melebihi batas permintaan. (${text})`
      );
      break;
    case 422:
      ToastError(
        `Unprocessable Entity, Permintaan tidak dapat diolah. (${text})`
      );
      break;
    case 500:
      ToastError("Kesalahan Pada Query", text);
      break;
    case 503:
      ToastError(
        `Layanan Tidak Tersedia, Layanan tidak tersedia saat ini. (${text})`
      );
      break;
    case 504:
      ToastError(`Waktu Habis, Permintaan waktu habis. (${text})`);
      break;
    case 505:
      ToastError(
        `Versi HTTP Tidak Didukung, Versi HTTP tidak didukung. (${text})`
      );
      break;
    case 507:
      ToastError(
        `Penyimpanan Tidak Cukup, Penyimpanan tidak mencukupi. (${text})`
      );
      break;
    case 511:
      ToastError(`Autentikasi Diperlukan, Autentikasi diperlukan. (${text})`);
      break;
    default:
      ToastError(`Kesalahan Server, ${text} `);
      break;
  }
};

export { ToastError, handleHttpError };
