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
import ModalPerforma from "../modal/detailPerforma";
import { useToast } from "@/components/context/ToastContext";
import MyContext from "@/utils/Context";
import Encrypt from "@/utils/Random";

export const BelanjaTerbesar = ({ selectedKanwil, selectedKddept }) => {
  const [dataDipa, setDataDipa] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [modal, setModal] = useState(false);
  const context = useContext(MyContext);

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
    let kanwilFilter = "";
    if (selectedKanwil && selectedKanwil !== "00") {
      kanwilFilter = ` and kdkanwil='${selectedKanwil}'`;
    }

    let kddeptFilter = "";
    if (selectedKddept && selectedKddept !== "000") {
      kddeptFilter = ` and kddept='${selectedKddept}'`;
    }

    const encodedQuery = encodeURIComponent(
      `SELECT 
  ${selectedKddept && selectedKddept !== "000" ? "kddept," : ""}
  jenbel,
  CASE
    WHEN jenbel = '51' THEN 'Pegawai'
    WHEN jenbel = '52' THEN 'Barang'
    WHEN jenbel = '53' THEN 'Modal'
    WHEN jenbel = '57' THEN 'Sosial'
    ELSE 'Lainnya'
  END AS jenis_belanja,
  SUM(pagu) AS pagu,
  SUM(realisasi) AS realisasi,
  SUM(realisasi) / NULLIF(SUM(pagu),0) * 100 AS persen
FROM dashboard.pagu_real_jenbel 
WHERE thang = '2022' ${kanwilFilter}${kddeptFilter}
GROUP BY jenbel;`
    );
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
      const { data } = err.response || {};
      showToast(data && data.error, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [selectedKanwil, selectedKddept]);

  const renderMainContent = () => {
    const jenbelData = dataDipa
      .map((item) => {
        const percentage =
          item.pagu > 0 ? (item.realisasi / item.pagu) * 100 : 0;
        const status =
          percentage >= 80
            ? "excellent"
            : percentage >= 60
            ? "on-track"
            : "warning";
        return {
          name: item.jenis_belanja,
          budget: formatTrillions(item.pagu / 1000000000000),
          realized: formatTrillions(item.realisasi / 1000000000000),
          percentage: Math.round(percentage),
          status,
        };
      })
      .sort((a, b) => {
        const budgetA = parseFloat(a.budget.replace(/[^\d.-]/g, ""));
        const budgetB = parseFloat(b.budget.replace(/[^\d.-]/g, ""));
        return budgetB - budgetA;
      });

    return (
      <CardBody className="pt-0 px-4 md:px-6">
        <div className="space-y-0">
          {jenbelData.slice(0, 4).map((jenbel, index) => (
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
                    {jenbel.name}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Progress
                      value={jenbel.percentage}
                      color={
                        jenbel.status === "excellent"
                          ? "success"
                          : jenbel.status === "on-track"
                          ? "primary"
                          : "warning"
                      }
                      size="md"
                      aria-label="belanjaterbesar"
                      className="w-full h-6"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-xs font-semibold drop-shadow-sm ${
                          theme === "dark" ? "text-white" : "text-slate-800"
                        }`}
                      >
                        Rp {jenbel.realized} / Rp {jenbel.budget}
                      </span>
                    </div>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      jenbel.status === "excellent"
                        ? "success"
                        : jenbel.status === "on-track"
                        ? "primary"
                        : "warning"
                    }
                    className="text-xs flex-shrink-0 font-semibold shadow-sm"
                  >
                    {jenbel.percentage}%
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
        <CardHeader className="pb-2 px-4 md:px-6">
          <div className="flex justify-between items-center w-full">
            <h3
              className={`text-sm md:text-base font-semibold ${
                getThemeClasses().textPrimary
              }`}
            >
              Jenis Belanja Terbesar
            </h3>
            <Chip
              color="primary"
              onClick={() => setModal(true)}
              variant="flat"
              size="sm"
              className="w-fit cursor-pointer"
            >
              Detail
            </Chip>
          </div>
        </CardHeader>
        {loading ? (
          <CardBody className="pt-0 px-4 md:px-6">Loading...</CardBody>
        ) : dataDipa.length === 0 ? (
          <CardBody className="pt-0 px-4 md:px-6">Tidak ada data</CardBody>
        ) : (
          renderMainContent()
        )}
      </Card>
      {modal && (
        <ModalPerforma isOpen={modal} onClose={() => setModal(false)} />
      )}
    </>
  );
};
