"use client";

import { useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
  Skeleton,
} from "@heroui/react";
import { Database, FileX } from "lucide-react";
import ModalPerforma from "@/components/home/modal/detailPerforma";
import MyContext from "@/utils/Context";
import { handleHttpError } from "@/components/notifikasi/toastError";
import Encrypt from "@/utils/Random";

const PerformaTerbesar = ({ selectedKanwil, selectedKddept }) => {
  const [dataDipa, setDataDipa] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const context = useContext(MyContext);
  const { theme } = useTheme();
  const [modalPerforma, setModalPerforma] = useState(false);
  const { token, axiosJWT } = context;

  const getThemeClasses = () => {
    const isDark = theme === "dark";
    return {
      cardBg: isDark
        ? "bg-gradient-to-br from-slate-800 to-slate-700"
        : "bg-gradient-to-br from-slate-100 to-slate-200",
      skeletonCardBg: isDark
        ? "bg-gradient-to-br from-slate-800 to-slate-700"
        : "bg-gradient-to-br from-default-50 to-default-100",
      skeletonItemBg: isDark ? "bg-slate-700/50" : "bg-default-50",
      textPrimary: isDark ? "text-slate-100" : "text-slate-900",
      textSecondary: isDark ? "text-slate-300" : "text-slate-700",
      textMuted: isDark ? "text-slate-400" : "text-slate-600",
    };
  };

  const formatTrillions = (amount) => {
    return (
      new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + " T"
    );
  };

  const getData = async () => {
    let kanwilFilter =
      selectedKanwil && selectedKanwil !== "00"
        ? ` and prk.kdkanwil='${selectedKanwil}'`
        : "";

    let kddeptFilter =
      selectedKddept && selectedKddept !== "000"
        ? ` and prk.kddept='${selectedKddept}'`
        : "";

    const encodedQuery = encodeURIComponent(`SELECT 
      prk.kddept,
      td.nmdept,
      SUM(prk.pagu) AS pagu,
      SUM(prk.realisasi) AS realisasi,
      SUM(prk.realisasi) / NULLIF(SUM(prk.pagu), 0) * 100 AS persen
    FROM dashboard.pagu_real_kl prk
    LEFT JOIN dbref.t_dept_2025 td ON prk.kddept = td.kddept
    WHERE prk.thang = '2022'${kanwilFilter}${kddeptFilter}
    GROUP BY prk.kddept
    ORDER BY pagu DESC
    LIMIT 4;`);

    const cleanedQuery = decodeURIComponent(encodedQuery)
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const encryptedQuery = Encrypt(cleanedQuery);

    try {
      setLoading(true);
      setError(null);
      const response = await axiosJWT.post(
        `${process.env.NEXT_PUBLIC_GET_REFERENSI}`,
        { query: encryptedQuery },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultData = response.data.result || [];
      setDataDipa(resultData);
    } catch (err) {
      const { status, data } = err.response || {};
      setDataDipa([]);
      handleHttpError(
        status,
        (data && data.error) ||
          "Terjadi Permasalahan Koneksi atau Server Backend"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const CardHeaderComponent = () => (
    <CardHeader className="pb-2 px-4 md:px-6">
      <div className="flex justify-between items-center w-full">
        <h3
          className={`text-sm md:text-base font-semibold ${
            getThemeClasses().textPrimary
          }`}
        >
          Performa K/L Terbesar
        </h3>
        <Chip
          color="primary"
          onClick={() => setModalPerforma(true)}
          variant="flat"
          size="sm"
          className="w-fit cursor-pointer"
        >
          Detail
        </Chip>
      </div>
    </CardHeader>
  );

  const renderLoadingContent = () => (
    <CardBody className="pt-0 px-4 md:px-6">
      <div className="space-y-2 md:space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className={`p-2 md:p-3 ${
              getThemeClasses().skeletonItemBg
            } rounded-lg space-y-2`}
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </CardBody>
  );

  const renderEmptyContent = () => (
    <CardBody className="pt-0 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileX className="w-12 h-12 text-default-400 mb-4" />
        <div className="mt-4">
          <Chip
            size="sm"
            variant="flat"
            color="warning"
            startContent={<Database className="w-3 h-3" />}
            className="text-xs"
          >
            Data Tidak Tersedia
          </Chip>
        </div>
      </div>
    </CardBody>
  );

  const renderMainContent = () => {
    const ministryData = dataDipa
      .map((item) => {
        const percentage =
          item.pagu > 0 ? (item.realisasi / item.pagu) * 100 : 0;
        const status =
          percentage >= 90
            ? "excellent"
            : percentage >= 80
            ? "on-track"
            : "warning";
        return {
          name: item.nmdept || `K/L ${item.kddept}`,
          budget: formatTrillions(item.pagu / 1000000000000),
          realized: formatTrillions(item.realisasi / 1000000000000),
          percentage: Math.round(percentage),
          status,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    return (
      <CardBody className="pt-0 px-4 md:px-6">
        <div className="space-y-0">
          {ministryData.slice(0, 4).map((ministry, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-0.5 md:p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="mb-0.5">
                  <h4
                    className={`font-medium text-xs truncate pr-2 ${
                      getThemeClasses().textSecondary
                    }`}
                  >
                    {ministry.name}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Progress
                      value={ministry.percentage}
                      color={
                        ministry.status === "excellent"
                          ? "success"
                          : ministry.status === "on-track"
                          ? "primary"
                          : "warning"
                      }
                      aria-label="performaterbesar"
                      size="md"
                      className="w-full h-6"
                      classNames={{
                        track:
                          "h-6 bg-gradient-to-r from-default-100 to-default-200 dark:from-slate-700 dark:to-slate-600 shadow-inner rounded-full border border-default-200 dark:border-slate-600",
                        indicator: `h-6 rounded-full shadow-lg transition-all duration-500 ease-out ${
                          ministry.status === "excellent"
                            ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-200 dark:shadow-green-900/50"
                            : ministry.status === "on-track"
                            ? "bg-gradient-to-r from-blue-400 to-indigo-500 shadow-blue-200 dark:shadow-blue-900/50"
                            : "bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-200 dark:shadow-amber-900/50"
                        }`,
                        label: "hidden",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-xs font-semibold drop-shadow-sm ${
                          theme === "dark" ? "text-white" : "text-slate-800"
                        }`}
                      >
                        Rp {ministry.realized} / Rp {ministry.budget}
                      </span>
                    </div>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      ministry.status === "excellent"
                        ? "success"
                        : ministry.status === "on-track"
                        ? "primary"
                        : "warning"
                    }
                    className="text-xs flex-shrink-0 font-semibold shadow-sm"
                  >
                    {ministry.percentage}%
                  </Chip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    );
  };

  return (
    <>
      <Card
        className={`border-none shadow-sm ${
          loading ? getThemeClasses().skeletonCardBg : getThemeClasses().cardBg
        } lg:col-span-6 xl:col-span-3`}
      >
        <CardHeaderComponent />
        {loading
          ? renderLoadingContent()
          : dataDipa.length === 0
          ? renderEmptyContent()
          : renderMainContent()}
      </Card>
      {modalPerforma && (
        <ModalPerforma
          isOpen={modalPerforma}
          onClose={() => setModalPerforma(false)}
        />
      )}
    </>
  );
};

export default PerformaTerbesar;
