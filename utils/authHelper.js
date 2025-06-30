/**
 * Helper functions untuk debugging dan pengelolaan autentikasi
 */

// Fungsi untuk mengecek apakah sedang di halaman auth
export const isAuthPage = () => {
  if (typeof window === "undefined") return false;
  const currentPath = window.location.pathname;
  return (
    currentPath.includes("/login") ||
    currentPath.includes("/register") ||
    currentPath.includes("/auth")
  );
};

// Fungsi untuk membersihkan semua data autentikasi
export const clearAllAuthData = async () => {
  if (typeof window !== "undefined") {
    // Hapus dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("status");

    // Hapus dari sessionStorage jika ada
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("status");
  }

  try {
    // Import dinamis untuk menghindari error server-side
    const { deleteAuthCookie } = await import("../actions/auth.action");
    await deleteAuthCookie();
  } catch (error) {
    console.error("❌ Error clearing auth cookies:", error);
  }
};

// Fungsi untuk memeriksa status autentikasi saat ini
export const checkAuthStatus = () => {
  if (typeof window === "undefined") {
    return {
      hasLocalStorageToken: false,
      localStorage: null,
      sessionStorage: null,
    };
  }

  const localStorageToken = localStorage.getItem("token");
  const sessionStorageToken = sessionStorage.getItem("token");
  const localStorageStatus = localStorage.getItem("status");

  return {
    hasLocalStorageToken: !!localStorageToken,
    hasSessionStorageToken: !!sessionStorageToken,
    localStorage: {
      token: localStorageToken,
      status: localStorageStatus,
    },
    sessionStorage: {
      token: sessionStorageToken,
    },
  };
};

// Fungsi untuk force logout dengan debugging
export const forceLogout = async (reason = "Manual logout") => {
  // Cek apakah sedang di halaman auth untuk menghindari loop
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isAuthPage =
    currentPath.includes("/login") || currentPath.includes("/register");

  await clearAllAuthData();

  // Redirect ke login hanya jika tidak sedang di halaman auth
  if (typeof window !== "undefined" && !isAuthPage) {
    window.location.href = "/login";
  }
};

// Fungsi untuk memantau perubahan localStorage secara real-time
export const setupStorageWatcher = (onTokenRemoved) => {
  if (typeof window === "undefined") return () => {};

  let lastTokenValue = localStorage.getItem("token");

  const checkInterval = setInterval(() => {
    const currentTokenValue = localStorage.getItem("token");

    if (lastTokenValue && !currentTokenValue) {
      onTokenRemoved();
    }

    lastTokenValue = currentTokenValue;
  }, 5000);

  const handleStorageChange = (e) => {
    if (e.key === "token" && !e.newValue && e.oldValue) {
      onTokenRemoved();
    }
  };

  window.addEventListener("storage", handleStorageChange);

  // Return cleanup function
  return () => {
    clearInterval(checkInterval);
    window.removeEventListener("storage", handleStorageChange);
  };
};
