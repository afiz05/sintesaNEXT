"use client";

import { useContext, useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Skeleton, Chip } from "@heroui/react";
import { useTheme } from "next-themes";
import { PieChart, Database, FileX } from "lucide-react";
import dynamic from "next/dynamic";
import MyContext from "@/utils/Context";
import Encrypt from "@/utils/Random";

const Chart = dynamic(() => import("./client-chart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Skeleton className="w-full h-64" />
    </div>
  ),
});

export const DukmanTeknis = ({ selectedKanwil, selectedKddept }) => {
  const [dataDukmanTeknis, setDataDukmanTeknis] = useState([]);
  const [loading, setLoading] = useState(false);
  const context = useContext(MyContext);
  const { theme } = useTheme();

  const { token, axiosJWT } = context;

  const formatTrillions = (amount) =>
    `${new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 1e12)} T`;

  const formatTrillionsForChart = (amount) =>
    `${new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(amount / 1e12)} T`;

  const getThemeColors = () => {
    const isDark = theme === "dark";
    return {
      primary: "#008FFB",
      success: "#00E396",
      strokeColor: isDark ? "#374151" : "#f3f4f6",
      textPrimary: isDark ? "#f3f4f6" : "#374151",
      tooltipBg: isDark ? "#1f2937" : "#ffffff",
      tooltipBorder: isDark ? "#374151" : "#e5e7eb",
      tooltipText: isDark ? "#f3f4f6" : "#374151",
      foreColor: isDark ? "#f3f4f6" : "#374151",
    };
  };

  const getThemeClasses = () => {
    const isDark = theme === "dark";
    return {
      cardBg: isDark
        ? "bg-gradient-to-br from-slate-800/90 to-slate-700/90"
        : "bg-gradient-to-br from-white/90 to-slate-50/90",
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

    const query = `SELECT thang,
      SUM(CASE WHEN jns_program = 'dukman' THEN pagu ELSE 0 END) AS pagu_dukman,
      SUM(CASE WHEN jns_program = 'teknis' THEN pagu ELSE 0 END) AS pagu_teknis,
      SUM(CASE WHEN jns_program = 'dukman' THEN ${Array.from(
        { length: 12 },
        (_, i) => `IFNULL(real${i + 1},0)`
      ).join("+")} ELSE 0 END) AS real_dukman,
      SUM(CASE WHEN jns_program = 'teknis' THEN ${Array.from(
        { length: 12 },
        (_, i) => `IFNULL(real${i + 1},0)`
      ).join("+")} ELSE 0 END) AS real_teknis
      FROM dashboard.tren_belanja_dukman_teknis
      WHERE thang = '2022'${kanwilFilter}${kddeptFilter}`;

    const encryptedQuery = Encrypt(
      query.replace(/\n/g, " ").replace(/\s+/g, " ").trim()
    );

    try {
      setLoading(true);
      const response = await axiosJWT.post(
        process.env.NEXT_PUBLIC_GET_REFERENSI,
        { query: encryptedQuery },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDataDukmanTeknis(response.data.result || []);
    } catch (err) {
      const { status, data } = err.response || {};
      setDataDukmanTeknis([]);
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
  }, [selectedKanwil, selectedKddept]);

  const isEmpty =
    dataDukmanTeknis.length === 0 ||
    Object.values(dataDukmanTeknis[0])
      .slice(1)
      .every((val) => val === 0 || val === null);

  if (loading) {
    return (
      <Card
        className={`border-none shadow-sm ${
          getThemeClasses().cardBg
        } lg:col-span-12 xl:col-span-6`}
      >
        <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
          <div className="flex justify-between items-center w-full">
            <Skeleton className="h-5 md:h-6 w-48 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </CardHeader>
        <CardBody className="pt-0 px-4 md:px-6">
          <div className="space-y-3">
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
            <div className="h-64 flex items-end justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-20 w-8 rounded-t" />
                <Skeleton className="h-24 w-8 rounded-t" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-16 w-8 rounded-t" />
                <Skeleton className="h-20 w-8 rounded-t" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full h-full">
        <Card
          className={`border-none shadow-sm ${getThemeClasses().cardBg} h-full`}
        >
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
        </Card>
      </div>
    );
  }

  const data = dataDukmanTeknis[0];
  const categories = ["Dukman", "Teknis"];
  const paguData = [data.pagu_dukman || 0, data.pagu_teknis || 0];
  const realisasiData = [data.real_dukman || 0, data.real_teknis || 0];
  const colors = getThemeColors();

  const series = [
    { name: "Pagu", data: paguData },
    { name: "Realisasi", data: realisasiData },
  ];

  const options = {
    chart: {
      type: "bar",
      animations: { speed: 300 },
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "inherit",
    },
    xaxis: {
      categories,
      labels: { style: { colors: colors.textPrimary } },
    },
    yaxis: {
      labels: {
        style: { colors: colors.textPrimary },
        formatter: formatTrillionsForChart,
      },
    },
    colors: [colors.primary, colors.success],
    stroke: {
      width: 2,
      colors: [colors.strokeColor],
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
        dataLabels: {
          position: "center",
          orientation: "vertical",
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "11px",
        fontWeight: 600,
        colors: [theme === "dark" ? "#ffffff" : "#1f2937"],
      },
      formatter: formatTrillionsForChart,
      offsetX: 0,
      offsetY: 0,
      textAnchor: "middle",
      background: { enabled: false },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "12px",
      fontWeight: 500,
      labels: { colors: colors.textPrimary },
      markers: { size: 8 },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      style: { fontSize: "12px" },
      y: { formatter: formatTrillions },
    },
    grid: {
      show: true,
      borderColor: colors.strokeColor,
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: {
            position: "top",
            fontSize: "10px",
            labels: { colors: colors.textPrimary },
          },
          dataLabels: {
            style: {
              fontSize: "10px",
              colors: [theme === "dark" ? "#ffffff" : "#1f2937"],
            },
          },
        },
      },
    ],
  };

  return (
    <div className="w-full h-full relative">
      <Chart
        key={theme}
        options={options}
        series={series}
        type="bar"
        height="100%"
        width="100%"
      />
    </div>
  );
};
