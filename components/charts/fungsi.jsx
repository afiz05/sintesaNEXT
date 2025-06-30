"use client";

import { useContext, useEffect, useState } from "react";
import { Card, CardBody, Skeleton, Chip } from "@heroui/react";
import { useTheme } from "next-themes";
import { Database, FileX } from "lucide-react";
import dynamic from "next/dynamic";
import Encrypt from "@/utils/Random";

const Chart = dynamic(() => import("./client-chart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Skeleton className="w-full h-64" />
    </div>
  ),
});

import { useToast } from "../context/ToastContext";
import MyContext from "../../utils/Context";

export const Fungsi = ({ selectedKanwil, selectedKddept }) => {
  const [dataDipaPerFungsi, setDataDipaPerFungsi] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { showToast } = useToast();
  const context = useContext(MyContext);
  const { token, axiosJWT } = context;

  const formatTrillions = (amount) => {
    return (
      new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount / 1_000_000_000_000) + " T"
    );
  };

  const getThemeColors = () => {
    const isDark = theme === "dark";
    return {
      foreColor: isDark ? "#a1a1aa" : "#52525b",
      borderColor: isDark ? "#3f3f46" : "#e4e4e7",
      gridColor: isDark ? "#27272a" : "#f4f4f5",
      axisColor: isDark ? "#52525b" : "#71717a",
      primary: "#3B82F6",
      success: "#10B981",
      textPrimary: isDark ? "#f3f4f6" : "#374151",
    };
  };

  const getData = async () => {
    let kanwilFilter =
      selectedKanwil && selectedKanwil !== "00"
        ? ` and a.kdkanwil='${selectedKanwil}'`
        : "";
    let kddeptFilter =
      selectedKddept && selectedKddept !== "000"
        ? ` and a.kddept='${selectedKddept}'`
        : "";

    const encodedQuery = encodeURIComponent(`
      SELECT a.thang, a.kddept, c.nmdept, a.kdfungsi, b.nmfungsi, a.kdkanwil, k.nmkanwil,
             SUM(a.pagu) AS pagu, SUM(a.realisasi) AS realisasi
      FROM dashboard.dipa_per_fungsi a
      LEFT JOIN dbref.t_fungsi_2025 b ON a.kdfungsi = b.kdfungsi
      LEFT JOIN dbref.t_kanwil_2025 k ON a.kdkanwil = k.kdkanwil
      LEFT JOIN dbref.t_dept_2025 c ON a.kddept = c.kddept
      WHERE a.thang='2025' ${kanwilFilter} ${kddeptFilter}
      GROUP BY a.kdfungsi
      ORDER BY a.thang, a.kdfungsi;
    `);

    const cleanedQuery = decodeURIComponent(encodedQuery)
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const encryptedQuery = Encrypt(cleanedQuery);

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
      setDataDipaPerFungsi(response.data.result || []);
    } catch (err) {
      showToast("Terjadi Permasalahan Koneksi atau Server Backend", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [selectedKanwil, selectedKddept]);

  if (loading) {
    return (
      <Card className="border-none shadow-sm bg-gradient-to-br from-default-50 to-default-100">
        <CardBody className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardBody>
      </Card>
    );
  }

  const getThemeClasses = () => {
    const isDark = theme === "dark";
    return {
      cardBg: isDark
        ? "bg-gradient-to-br from-slate-800/90 to-slate-700/90"
        : "bg-gradient-to-br from-white/90 to-slate-50/90",
    };
  };

  const isEmpty =
    dataDipaPerFungsi.length === 0 ||
    Object.values(dataDipaPerFungsi[0])
      .slice(2)
      .every((val) => val === 0 || val === null);

  if (isEmpty) {
    return (
      <div className="w-full h-full">
        <Card
          className={`border-none shadow-sm ${getThemeClasses().cardBg} h-full`}
        >
          <CardBody className="pt-0 px-4 md:px-6 flex flex-col items-center justify-center text-center py-8">
            <FileX className="w-12 h-12 text-default-400 mb-4" />
            <Chip
              size="sm"
              variant="flat"
              color="warning"
              startContent={<Database className="w-3 h-3" />}
              className="text-xs"
            >
              Data Tidak Tersedia
            </Chip>
          </CardBody>
        </Card>
      </div>
    );
  }

  const fungsiMap = new Map();
  dataDipaPerFungsi.forEach((item) => {
    const key = item.kdfungsi;
    const existing = fungsiMap.get(key);
    if (existing) {
      existing.pagu += item.pagu || 0;
      existing.realisasi += item.realisasi || 0;
    } else {
      fungsiMap.set(key, {
        nmfungsi: item.nmfungsi || `Fungsi ${key}`,
        pagu: item.pagu || 0,
        realisasi: item.realisasi || 0,
      });
    }
  });

  const sortedEntries = Array.from(fungsiMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const kodeFungsiList = sortedEntries.map(([kdfungsi]) => kdfungsi);
  const fungsiNamesLengkap = sortedEntries.map(([_, data]) => data.nmfungsi);
  const paguData = sortedEntries.map(([_, data]) => data.pagu);
  const realisasiData = sortedEntries.map(([_, data]) => data.realisasi);

  const series = [
    { name: "Pagu", data: paguData },
    { name: "Realisasi", data: realisasiData },
  ];

  const colors = getThemeColors();

  const options = {
    chart: {
      type: "area",
      animations: { speed: 300 },
      stacked: true,
      toolbar: { show: false },
      parentHeightOffset: 0,
      foreColor: colors.foreColor,
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => formatTrillions(value),
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
    xaxis: {
      categories: kodeFungsiList,
      labels: { style: { colors: colors.foreColor } },
      axisBorder: { color: colors.borderColor },
      axisTicks: { color: colors.borderColor },
    },
    yaxis: {
      labels: {
        style: { colors: colors.foreColor },
        formatter: (value) => formatTrillions(value),
      },
    },
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      style: { fontSize: "12px" },
      x: {
        formatter: (_, { dataPointIndex }) =>
          fungsiNamesLengkap[dataPointIndex],
      },
      y: {
        formatter: (value) => formatTrillions(value),
      },
    },
    colors: [colors.primary, colors.success],
    grid: {
      show: true,
      borderColor: colors.gridColor,
      strokeDashArray: 0,
      position: "back",
    },
    stroke: {
      curve: "smooth",
    },
    markers: { show: false },
  };

  return (
    <div className="w-full h-full relative">
      <Chart
        key={theme}
        options={options}
        series={series}
        type="area"
        height="100%"
        width="100%"
      />
    </div>
  );
};
