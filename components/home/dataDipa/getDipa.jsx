"use client";

import { useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Card, CardBody, Chip, Skeleton } from "@heroui/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Wallet,
  Building2,
  Target,
  Database,
} from "lucide-react";
import { useToast } from "@/components/context/ToastContext";
import MyContext from "@/utils/Context";
import Encrypt from "@/utils/Random";

export const GetDipa = ({ selectedKanwil, selectedKddept }) => {
  const [dataDipa, setDataDipa] = useState(null);
  const [loading, setLoading] = useState(false);
  const context = useContext(MyContext);
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { token, axiosJWT } = context || {};

  const getThemeClasses = () => {
    const isDark = theme === "dark";
    return {
      cardBg: isDark
        ? "bg-gradient-to-br from-slate-800/90 to-slate-700/90"
        : "bg-gradient-to-br from-white/90 to-slate-50/90",
      cardBgPrimary: isDark
        ? "bg-gradient-to-br from-blue-900/80 to-blue-800/70"
        : "bg-gradient-to-br from-blue-50 to-blue-100/90",
      cardBgSuccess: isDark
        ? "bg-gradient-to-br from-green-900/80 to-green-800/70"
        : "bg-gradient-to-br from-green-50 to-green-100/90",
      cardBgWarning: isDark
        ? "bg-gradient-to-br from-amber-900/80 to-amber-800/70"
        : "bg-gradient-to-br from-amber-50 to-amber-100/90",
      cardBgSecondary: isDark
        ? "bg-gradient-to-br from-purple-900/80 to-purple-800/70"
        : "bg-gradient-to-br from-purple-50 to-purple-100/90",
      textPrimary: isDark ? "text-slate-100" : "text-slate-900",
      textSecondary: isDark ? "text-slate-300" : "text-slate-600",
    };
  };

  const getData = async () => {
    let kanwilFilter =
      selectedKanwil && selectedKanwil !== "00"
        ? ` and kdkanwil='${selectedKanwil}'`
        : "";
    let kddeptFilter =
      selectedKddept && selectedKddept !== "000"
        ? ` and kddept='${selectedKddept}'`
        : "";

    const query = `
      SELECT SUM(pagu)/1000000000000 AS pagu, SUM(realisasi)/1000000000000 AS realisasi,
      (SUM(pagu) - SUM(realisasi))/1000000000000 AS sisa,
      (SELECT SUM(jml) FROM dashboard.dipa_satker_rekap where thang='2022'${kanwilFilter}${kddeptFilter}) AS jumlah_dipa,
      ROUND(SUM(persen_dipa) / 1000000, 2) AS persen
      FROM dashboard.pagu_real_kl prk
      WHERE thang='2022' and kddept<>'999'${kanwilFilter}${kddeptFilter} LIMIT 1;
    `;
    const cleanedQuery = decodeURIComponent(query)
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    try {
      setLoading(true);
      const response = await axiosJWT.post(
        process.env.NEXT_PUBLIC_GET_REFERENSI,
        { query: Encrypt(cleanedQuery) },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDataDipa(response.data.result?.[0] || null);
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

  const formatTrillions = (val) =>
    `${new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val)} T`;
  const formatNumber = (val) => new Intl.NumberFormat("id-ID").format(val);

  if (loading || !dataDipa) return null; // Simplified loading/null handling for this JSX conversion

  const realisasiPercentage = (dataDipa.realisasi / dataDipa.pagu) * 100;
  const sisaPercentage = (dataDipa.sisa / dataDipa.pagu) * 100;

  const stats = [
    {
      title: "Total Pagu",
      value: formatTrillions(dataDipa.pagu),
      icon: Wallet,
      color: "primary",
      trend: "up",
      change: "+2.5%",
    },
    {
      title: "Realisasi",
      value: formatTrillions(dataDipa.realisasi),
      icon: TrendingUp,
      color: "success",
      trend: realisasiPercentage > 50 ? "up" : "down",
      change: `${realisasiPercentage.toFixed(1)}%`,
    },
    {
      title: "Sisa Anggaran",
      value: formatTrillions(dataDipa.sisa),
      icon: DollarSign,
      color: "warning",
      trend: sisaPercentage > 30 ? "up" : "down",
      change: `${sisaPercentage.toFixed(1)}%`,
    },
    {
      title: "Jumlah DIPA",
      value: formatNumber(dataDipa.jumlah_dipa),
      icon: Building2,
      color: "secondary",
      trend: "up",
      change: `${formatNumber(dataDipa.jumlah_dipa)} unit`,
    },
    {
      title: "Efisiensi Anggaran",
      value: `${dataDipa.persen}%`,
      icon: Target,
      color: "primary",
      trend: dataDipa.persen > 80 ? "up" : "down",
      change: `${dataDipa.persen}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-12 gap-2 md:gap-3 mt-2 md:mt-3">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`border-none shadow-sm hover:shadow-md transition-shadow ${
            getThemeClasses()[
              `cardBg${
                stat.color.charAt(0).toUpperCase() + stat.color.slice(1)
              }`
            ] || getThemeClasses().cardBg
          } ${
            index === 0
              ? "lg:col-span-2"
              : index === 1
              ? "lg:col-span-2"
              : index === 2
              ? "lg:col-span-2"
              : index === 3
              ? "lg:col-span-3"
              : "lg:col-span-3"
          }`}
        >
          <CardBody className="p-2 md:p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1">
                <div
                  className={`p-1 md:p-1.5 rounded-lg bg-${stat.color}/20 border border-${stat.color}/30 flex-shrink-0`}
                >
                  <stat.icon
                    className={`h-3 w-3 md:h-4 md:w-4 text-${stat.color}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs ${
                      getThemeClasses().textSecondary
                    } truncate`}
                  >
                    {stat.title}
                  </p>
                  <p
                    className={`text-sm md:text-lg font-semibold ${
                      getThemeClasses().textPrimary
                    } truncate`}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-2 w-2 md:h-3 md:w-3 text-success-600" />
                ) : (
                  <ArrowDownRight className="h-2 w-2 md:h-3 md:w-3 text-danger-600" />
                )}
                <span
                  className={`text-xs font-medium ${
                    stat.trend === "up" ? "text-success-600" : "text-danger-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
