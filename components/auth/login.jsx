"use client";

import { createAuthCookie } from "@/actions/auth.action";
import { LoginSchema } from "@/helpers/schemas";
import { useToast } from "@/components/context/ToastContext";
import { Button, Input, Image, Card, CardBody, Divider } from "@heroui/react";
import SintesaLogoDark from "../icons/logo/snext_dark.svg";
import { Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect, useContext } from "react";
import { Copyright } from "lucide-react";
import axios from "axios";

import { PageTransitionSuccess } from "./PageTransitionSuccess";
import MyContext from "@/utils/Context";
import { decryptData } from "@/utils/Decrypt";
import { jwtDecode } from "jwt-decode";
import { handleHttpError } from "@/components/notifikasi/toastError";

export const Login = () => {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error("Login must be used within MyContextProvider");
  }

  const {
    setVerified,
    setNmrole,
    setRole,
    setName,
    setActive,
    setKdlokasi,
    setKdkanwil,
    setDeptlimit,
    setKdkppn,
    setExpire,
    setToken,
    setIduser,
    setUrl,
    setstatusLogin,
    setUsername,
    setMode,
    setTampil,
    setTampilverify,
    setStatus,
    setPersentase,
    setSession,
    setNamelogin,
    setLoggedInUser2,
    setLoggedinUsers,
    telp,
    setTelp,
    offline,
    setOffline,
    offlinest,
    setOfflinest,
  } = context;

  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [chap, setChap] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState("");
  const [error, setError] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setName("");
    setRole("");
    setNmrole("");
    setVerified("");
    setActive("");
    setKdlokasi("");
    setKdkanwil("");

    setDeptlimit("");
    setKdkppn("");
    setExpire("");
    setToken("");
    setIduser("");
    setUrl("");
    setstatusLogin("");
    setUsername("");
    setMode("");
    setTampil("");
    setTampilverify("");
    setStatus("");
    setPersentase("");
    setSession("");
    setNamelogin("");
    setLoggedInUser2("");
    setLoggedinUsers("");
  };

  const initialValues = {
    username: "",
    password: "",
    captcha: "",
  };

  // Generate captcha for chap === "0" mode
  const generateCaptcha = useCallback(() => {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const captchaString = randomNum.toString();
    const formattedCaptcha = insertRandomSpaces(captchaString);
    setCaptcha(formattedCaptcha);
  }, []);

  const insertRandomSpaces = (input) => {
    const numberOfSpaces = Math.floor(Math.random() * (input.length - 1)) + 1;
    let output = "";
    for (let i = 0; i < input.length; i++) {
      output += input[i];
      if (i < input.length - 1 && i < numberOfSpaces) {
        output += " ";
      }
    }
    return output;
  };

  // Check captcha mode from backend
  const cekMode = async () => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_LOCAL_CEKMODE || ""
      );
      setChap(response.data.capcay);
    } catch (error) {
      console.log(error);
      setError("Captcha mode check failed");
      setChap("0");
      setOffline(true);
      window.location.href = "/v3/next/offline";
      showToast("Mode Offline", "error");
    }
  };

  useEffect(() => {
    cekMode();
  }, []);

  useEffect(() => {
    if (chap === "0") {
      generateCaptcha();

      const interval = setInterval(() => {
        generateCaptcha();
      }, 20000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [chap, generateCaptcha]);

  const handleLogin = useCallback(
    async (values) => {
      // Validate captcha first
      if (chap === "1" && recaptchaValue === "") {
        setError("Captcha belum Diverifikasi");
        showToast("Please complete the captcha verification.", "warning");
        return;
      } else if (chap === "0") {
        const cleanedCaptcha = values.captcha?.replace(/\s/g, "") || "";
        if (cleanedCaptcha !== captcha.replace(/\s/g, "")) {
          showToast("Captcha code is incorrect.", "error");
          return;
        }
      } else if (chap === "") {
        setError("Captcha Error");
        showToast("Captcha system error.", "error");
        return;
      }

      setIsLoading(true);

      try {
        const response = await axios.post(
          process.env.NEXT_PUBLIC_LOCAL_LOGIN ?? "",
          values,
          { withCredentials: true }
        );
        const data = response.data;

        if (!data.success) {
          if (data.msg === "Password Anda Tidak Sesuai") {
            setError("Password Anda Tidak Sesuai");
            showToast("Password Anda Tidak Sesuai", "error");
          } else if (data.msg === "User tidak ditemukan") {
            setError("User tidak ditemukan");
            showToast("User Tidak Ditemukan", "error");
          } else {
            setError("Terjadi kesalahan saat login");
            showToast("Terjadi Kesalahan saat login", "error");
          }
          setLoading(false);
        } else {
          resetState();

          const decrypted = decryptData(data.tokenSetLogin);
          const decoded = jwtDecode(decrypted);

          setTelp(decoded.telp);
          setToken(data.tokenSetLogin);
          setstatusLogin(true);
          setLoading(false);
          setName(decoded.name);
          setExpire(decoded.exp.toString());
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

          setShowSuccessAnimation(true);
          localStorage.setItem("status", "true");
          localStorage.setItem("token", data.tokenSetLogin); // Persist token for refresh
          await createAuthCookie("token", data.tokenSetLogin); // Gunakan token sebenarnya
        }
      } catch (error) {
        console.log(error);

        showToast("Login failed. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [router, showToast, chap, recaptchaValue, captcha]
  );

  const handlePinLogin = useCallback(async () => {
    if (!pinValue) {
      showToast("Please enter your 6-digit PIN.", "warning");
      return;
    }

    if (pinValue.length !== 6) {
      showToast("PIN must be exactly 6 digits.", "warning");
      return;
    }

    setIsPinLoading(true);

    // Temporary hardcoded PIN for testing
    const TEMP_PIN = "123456";

    try {
      // Check if PIN is correct
      if (pinValue !== TEMP_PIN) {
        showToast("Invalid PIN. Please try again.", "error");
        setPinValue("");
        return;
      }

      // PIN is correct, proceed with login
      setShowSuccessAnimation(true);
      localStorage.setItem("status", "true");
      // Untuk PIN login, kita buat token dummy atau gunakan sistem lain
      await createAuthCookie("token", "pin_authenticated");
    } catch (error) {
      showToast("PIN login failed. Please try again.", "error");
    } finally {
      setIsPinLoading(false);
    }
  }, [pinValue, showToast]);

  const handleSuccessAnimationComplete = useCallback(() => {
    setShowSuccessAnimation(false);
    router.replace("/");
  }, [router]);

  return (
    <div className="flex flex-col items-center w-full">
      <PageTransitionSuccess
        isVisible={showSuccessAnimation}
        onComplete={handleSuccessAnimationComplete}
        duration={2500}
      />

      <div className="text-center text-[25px] font-bold mb-8">
        <SintesaLogoDark className="h-8 w-auto" />
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
        context={{ chap }}
        onSubmit={handleLogin}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <>
            <div className="flex flex-col w-2/3 md:w-1/4 gap-4 mb-4">
              <Input
                autoFocus
                variant="bordered"
                label="Username"
                type="text"
                value={values.username}
                isInvalid={!!errors.username && !!touched.username}
                errorMessage={errors.username}
                onChange={handleChange("username")}
              />
              <Input
                variant="bordered"
                label="Password"
                type="password"
                value={values.password}
                isInvalid={!!errors.password && !!touched.password}
                errorMessage={errors.password}
                onChange={handleChange("password")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </div>

            {chap === "0" && (
              <div className="w-2/3 md:w-1/4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Card className="flex-1 min-w-0 flex items-center justify-center h-12 sm:h-14 bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <CardBody className="p-2 flex items-center justify-center">
                      <div className="text-lg sm:text-2xl font-bold text-center text-slate-600 dark:text-white tracking-wider break-all">
                        {captcha}
                      </div>
                    </CardBody>
                  </Card>
                  <div className="flex-1 min-w-0">
                    <Input
                      variant="bordered"
                      label="Kode Captcha"
                      type="text"
                      maxLength={4}
                      value={values.captcha || ""}
                      onChange={(e) => {
                        // Only allow numbers
                        const numericValue = e.target.value.replace(/\D/g, "");
                        // Create a new event with numeric value
                        const syntheticEvent = {
                          ...e,
                          target: {
                            ...e.target,
                            value: numericValue,
                          },
                        };
                        handleChange("captcha")(syntheticEvent);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSubmit();
                        }
                      }}
                      isInvalid={!!errors.captcha && !!touched.captcha}
                      errorMessage={errors.captcha}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {chap === "1" && (
              <div className="flex w-2/3 md:w-1/2 justify-center mb-4">
                {/* <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={handleRecaptchaChange}
                /> */}
              </div>
            )}

            <Button
              className="w-2/3 md:w-1/4 min-h-[36px] h-10 flex-shrink-0 login-button mt-2 font-semibold overflow-hidden"
              onPress={() => handleSubmit()}
              color="primary"
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              <span className="truncate whitespace-nowrap">
                {isLoading ? "Logging in..." : "Login"}
              </span>
            </Button>
            <Divider className="w-2/3 md:w-1/4 my-6" />

            {/* PIN Login Section */}
            <div className="flex w-2/3 md:w-1/4 flex-wrap md:flex-nowrap gap-4">
              <Input
                variant="bordered"
                label="PIN 6 Digit"
                type="password"
                maxLength={6}
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePinLogin();
                  }
                }}
                classNames={{
                  label: "text-sm",
                }}
              />
              <Button
                className="w-full flex h-14 font-semibold"
                onPress={handlePinLogin}
                variant="ghost"
                color="danger"
                isLoading={isPinLoading}
                isDisabled={isPinLoading}
              >
                {isPinLoading ? "Logging in..." : "Login PIN"}
              </Button>
            </div>
          </>
        )}
      </Formik>

      <div className="text-slate-400 mt-6 text-sm tracking-wider font-sans">
        Belum Punya Akun ?{" "}
        <Link href="/register" className="font-bold">
          Hubungi Admin
        </Link>
      </div>
      <Divider className="w-2/3 md:w-1/4 my-6" />

      <div className="font-semibold text-slate-400 text-xs tracking-wider flex items-center font-sans gap-1">
        <Copyright size={13} />
        <label>2025 Direktorat PA | PDPSIPA</label>
      </div>
    </div>
  );
};
