"use client";
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { handleHttpError } from "../components/notifikasi/toastError";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import { decryptData } from "./Decrypt";
import Notifikasi from "../components/notifikasi/notif";
import { createAuthCookie, deleteAuthCookie } from "../actions/auth.action";
import {
  setupStorageWatcher,
  checkAuthStatus as debugAuthStatus,
  isAuthPage,
} from "./authHelper";

const MyContext = createContext({
  role: "",
  telp: "",
  verified: "",
  name: "",
  statusLogin: false,
  token: "",
  axiosJWT: null,
});

export const MyContextProvider = ({ children }) => {
  const router = useRouter();
  const [loggedinUsers, setLoggedinUsers] = useState([]);
  const [loggedInUser2, setLoggedInUser2] = useState(null);
  const [namelogin, setNamelogin] = useState(null);
  const [name, setName] = useState("");
  const [session, setSession] = useState("");
  const [role, setRole] = useState("");
  const [nmrole, setNmrole] = useState("");
  const [active, setActive] = useState("");
  const [kdlokasi, setKdlokasi] = useState("");
  const [verified, setVerified] = useState("");
  const [kdkanwil, setKdkanwil] = useState("");
  const [deptlimit, setDeptlimit] = useState("");
  const [kdkppn, setKdkppn] = useState("");
  const [expire, setExpire] = useState("");
  const [token, setToken] = useState("");
  const [iduser, setIduser] = useState("");
  const [url, setUrl] = useState("");
  const [statusLogin, setstatusLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("");
  const [tampil, setTampil] = useState("");
  const [tampilverify, setTampilverify] = useState("");
  const [status, setStatus] = useState("");
  const [persentase, setPersentase] = useState([]);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [stat, setStat] = useState("");
  const [processquery, setProccess] = useState("");
  const [errorprocessquery, seterrorProccess] = useState("");
  const [loadingExcell, setloadingExcell] = useState(false);
  const [totNotif, settotNotif] = useState(0);
  const [listNotif, setlistNotif] = useState([]);
  const [visibilityStatuses, setVisibilityStatuses] = useState({});
  const [offline, setOffline] = useState(false);
  const [offlinest, setOfflinest] = useState("");
  const [telp, setTelp] = useState("");
  const [tampilAI, settampilAI] = useState(false);
  const [loginDengan, setloginDengan] = useState(null);
  const [dataEpa, setDataEpa] = useState({});
  const [viewMode, setViewMode] = useState("sppg");

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (typeof window === "undefined") {
        return;
      }

      // Cek apakah sedang di halaman login/register untuk menghindari loop
      const currentPath = window.location.pathname;
      const isOnAuthPage = isAuthPage();

      try {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
          setstatusLogin(false);
          await deleteAuthCookie(); // Hapus cookie auth

          // Hanya redirect jika tidak sedang di halaman auth
          if (!isOnAuthPage) {
            window.location.href = "/login";
          }
          return;
        }

        const decoded = jwtDecode(decryptData(storedToken));
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          setToken(storedToken);
          setName(decoded.name);
          setExpire(decoded.exp);
          setstatusLogin(true);
          setRole(decoded.role);
          setKdkanwil(decoded.kdkanwil);
          setKdkppn(decoded.kdkppn);
          setKdlokasi(decoded.kdlokasi);
          setActive(decoded.active);
          setDeptlimit(decoded.dept_limit);
          setNmrole(decoded.namarole);
          setIduser(decoded.userId);
          setUrl(decoded.url);
          setUsername(decoded.username);
          setMode(decoded.mode);
          setTampil(decoded.tampil);
          setTampilverify(decoded.tampilverify);
          setSession(decoded.session);
          setVerified(decoded.verified);
          setTelp(decoded.telp);

          // Sinkronisasi dengan cookie auth
          await createAuthCookie("token", storedToken);
        } else {
          await refreshToken();
        }
      } catch (error) {
        console.error("Error in checkAndRefreshToken:", error);
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        await deleteAuthCookie(); // Hapus cookie auth
        setstatusLogin(false);

        // Hanya redirect jika tidak sedang di halaman auth
        if (!isOnAuthPage) {
          window.location.href = "/login";
        }
      }
    };

    checkAndRefreshToken();
  }, []);

  // Efek untuk memantau perubahan localStorage token
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Setup watcher menggunakan helper function yang lebih robust
    const cleanup = setupStorageWatcher(() => {
      const isOnAuthPage = isAuthPage();

      if (statusLogin && !isOnAuthPage) {
        console.log("🚨 Token removal detected, executing logout...");
        logout();
      }
    });

    return cleanup;
  }, [statusLogin]);

  const logout = async () => {
    try {
      debugAuthStatus(); // Debug current state

      // Cek apakah sedang di halaman login untuk menghindari loop
      const isOnAuthPage = isAuthPage();

      setLogoutLoading(true);
      setUsername("");

      // Hanya panggil backend logout jika ada endpoint
      try {
        await axios.delete(process.env.NEXT_PUBLIC_LOCAL_LOGOUT);
      } catch (error) {
        console.log(
          "Backend logout failed (might be expected):",
          error.message
        );
      }

      setstatusLogin(false);
      setOffline(false);
      setLoggedinUsers([]);
      setTampil(false);
      setTampilverify(false);
      setNamelogin(null);
      setTelp("");
      setloginDengan(null);

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("status");
      }

      // Hapus cookie auth
      await deleteAuthCookie();

      // console.log("✅ Logout process completed successfully");

      if (stat === "true") {
        Swal.fire({
          position: "top",
          icon: "success",
          title: "Logout Berhasil",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("❌ Logout process failed:", error);
      Swal.fire({
        position: "top",
        icon: "error",
        title: "Logout Gagal",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLogoutLoading(false);

      // Hanya redirect jika tidak sedang di halaman auth
      const isOnAuthPage = isAuthPage();

      if (!isOnAuthPage) {
        router.push("/login");
      }
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_LOCAL_REFRESH_TOKEN,
        {
          withCredentials: true,
        }
      );

      const newAccessToken = response.data.accessToken;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", newAccessToken);
      }

      setToken(newAccessToken);
      const decoded = jwtDecode(decryptData(newAccessToken));

      setName(decoded.name);
      setExpire(decoded.exp);
      setstatusLogin(true);
      setRole(decoded.role);
      setKdkanwil(decoded.kdkanwil);
      setKdkppn(decoded.kdkppn);
      setKdlokasi(decoded.kdlokasi);
      setActive(decoded.active);
      setDeptlimit(decoded.dept_limit);
      setNmrole(decoded.namarole);
      setIduser(decoded.userId);
      setUrl(decoded.url);
      setUsername(decoded.username);
      setMode(decoded.mode);
      setTampil(decoded.tampil);
      setTampilverify(decoded.tampilverify);
      setSession(decoded.session);
      setVerified(decoded.verified);
      setTelp(decoded.telp);

      // Sinkronisasi dengan cookie auth
      await createAuthCookie("token", newAccessToken);
    } catch (error) {
      console.error("Error refreshing token:", error);
      if (error.response) {
        setstatusLogin(false);
        setToken("");
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("status");
        }
        await deleteAuthCookie(); // Hapus cookie auth

        // Hanya redirect jika tidak sedang di halaman auth
        const isOnAuthPage = isAuthPage();

        if (!isOnAuthPage) {
          window.location.href = "/login";
        }
      }
    }
  };

  const axiosJWT = axios.create({
    withCredentials: true,
  });

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentTime = Date.now() / 1000;

      if (expire < currentTime && localStorage.getItem("token")) {
        try {
          const response = await axios.get(
            process.env.NEXT_PUBLIC_LOCAL_REFRESH_TOKEN,
            {
              withCredentials: true,
            }
          );
          const newAccessToken = response.data.accessToken;

          if (typeof window !== "undefined") {
            localStorage.setItem("token", newAccessToken);
          }

          setToken(newAccessToken);

          const decoded = jwtDecode(decryptData(newAccessToken));
          setName(decoded.name);
          setExpire(decoded.exp);
          setstatusLogin(true);
          setRole(decoded.role);
          setKdkanwil(decoded.kdkanwil);
          setKdkppn(decoded.kdkppn);
          setKdlokasi(decoded.kdlokasi);
          setActive(decoded.active);
          setDeptlimit(decoded.dept_limit);
          setNmrole(decoded.namarole);
          setIduser(decoded.userId);
          setUrl(decoded.url);
          setUsername(decoded.username);
          setMode(decoded.mode);
          setTampil(decoded.tampil);
          setTampilverify(decoded.tampilverify);
          setSession(decoded.session);
          setVerified(decoded.verified);
          setTelp(decoded.telp);

          // Sinkronisasi dengan cookie auth
          await createAuthCookie("token", newAccessToken);

          config.headers.Authorization = `Bearer ${newAccessToken}`;
        } catch (error) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
          }
          await deleteAuthCookie(); // Hapus cookie auth

          // Hanya logout jika tidak sedang di halaman auth
          const isOnAuthPage = isAuthPage();

          if (!isOnAuthPage) {
            logout();
          }
          return Promise.reject(error);
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (statusLogin && session === "1" && namelogin !== "") {
      cekLogin();
    }
  }, [namelogin]);

  useEffect(() => {
    stat === "false" &&
      Notifikasi("System melakukan logout otomatis terhadap akun anda.");
    stat === "false" && logout();
  }, [stat]);

  const cekLogin = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_LOCAL_CEKLOGIN}?username=${username}`
      );

      setStat(response.data);
    } catch (error) {
      handleHttpError("Terjadi Permasalahan Koneksi atau Server Backend ");
      setstatusLogin(false);
      setTampil(false);
      setTampilverify(false);
    }
  };
  useEffect(() => {
    if (statusLogin) {
      const socket = io(process.env.NEXT_PUBLIC_LOCAL_SOCKET);
      socket.on("nmuser", (nmuser) => {
        if (nmuser) {
          const uppercaseNamelogin = nmuser.toUpperCase();
          setLoggedinUsers((prevUsers) => [...prevUsers, uppercaseNamelogin]);
          setNamelogin(uppercaseNamelogin);
        } else {
          setNamelogin(null);
        }
      });

      socket.on("loginBy", (loginBy) => {
        if (loginBy) {
          setloginDengan(loginBy);
        }
      });
      return () => {
        socket.off("userLoggedin");
        socket.off("nmuser");
        socket.off("loginBy");
      };
    }
  }, [statusLogin, loginDengan]);

  useEffect(() => {
    if (statusLogin) {
      const socket = io(process.env.NEXT_PUBLIC_LOCAL_SOCKET);
      socket.on("running_querys", (running_querys) => {
        if (running_querys) {
          const uppercaseProccess = running_querys.toLowerCase();
          setProccess((prev) => [...prev, uppercaseProccess]);
        } else {
          setProccess([]);
        }
      });
      socket.on("error_querys", (error_querys) => {
        if (error_querys) {
          const uppercaseProccessError = error_querys.toLowerCase();
          seterrorProccess((preverror) => [
            ...preverror,
            uppercaseProccessError,
          ]);
        } else {
          seterrorProccess([]);
        }
      });

      return () => {
        socket.off("running_querys");
        socket.off("error_querys");
      };
    }
  }, [statusLogin]);

  return (
    <MyContext.Provider
      value={{
        processquery,
        errorprocessquery,
        setLoggedinUsers,
        setNamelogin,
        namelogin,
        setLoggedInUser2,
        loggedInUser2,
        logout,
        loggedinUsers,
        setSession,
        setExpire,
        setToken,
        setMode,
        setTampil,
        setTampilverify,
        setStatus,
        url,
        setUrl,
        statusLogin,
        name,
        setName,
        setstatusLogin,
        role,
        kdkanwil,
        kdkppn,
        kdlokasi,
        setRole,
        setKdkanwil,
        setKdkppn,
        setKdlokasi,
        setActive,
        expire,
        token,
        axiosJWT,
        active,
        deptlimit,
        setDeptlimit,
        setNmrole,
        nmrole,
        setIduser,
        iduser,
        setUsername,
        username,
        mode,
        status,
        tampil,
        tampilverify,
        persentase,
        setPersentase,
        loadingExcell,
        setloadingExcell,
        setVerified,
        verified,
        totNotif,
        settotNotif,
        listNotif,
        setlistNotif,
        visibilityStatuses,
        setVisibilityStatuses,
        offline,
        setOffline,
        offlinest,
        setOfflinest,
        telp,
        setTelp,
        tampilAI,
        settampilAI,
        loginDengan,
        setloginDengan,
        dataEpa,
        setDataEpa,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export default MyContext;
