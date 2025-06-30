"use client";

import { useContext, useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Skeleton, Chip } from "@heroui/react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { Database, FileX } from "lucide-react";
import MyContext from "@/utils/Context";
import { handleHttpError } from "../notifikasi/toastError";
import Encrypt from "@/utils/Random";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Skeleton className="w-full h-64" />
    </div>
  ),
});

export default function TrenApbn({ selectedKanwil, selectedKddept }) {
  const [dataRencanaReal, setDataRencanaReal] = useState([]);
  const [loading, setLoading] = useState(false);
  const context = useContext(MyContext);
  const { theme } = useTheme();

  const { token, axiosJWT } = context || {};

  const formatTrillions = (amount) =>
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(amount) + " T";

  const getThemeColors = () => {
    const isDark = theme === "dark";
    return {
      foreColor: isDark ? "#a1a1aa" : "#52525b",
      borderColor: isDark ? "#3f3f46" : "#e4e4e7",
      gridColor: isDark ? "#27272a" : "#f4f4f5",
      textPrimary: isDark ? "#f3f4f6" : "#374151",
      primary: "#3B82F6",
      success: "#10B981",
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

    const rawQuery = `SELECT a.kddept,b.nmdept,
      ROUND(sum(renc1)/1, 0) as renc1, ROUND(sum(real1)/1, 0) as real1,
      ROUND(sum(renc2)/1, 0) as renc2, ROUND(sum(real2)/1, 0) as real2,
      ROUND(sum(renc3)/1, 0) as renc3, ROUND(sum(real3)/1, 0) as real3,
      ROUND(sum(renc4)/1, 0) as renc4, ROUND(sum(real4)/1, 0) as real4,
      ROUND(sum(renc5)/1, 0) as renc5, ROUND(sum(real5)/1, 0) as real5,
      ROUND(sum(renc6)/1, 0) as renc6, ROUND(sum(real6)/1, 0) as real6,
      ROUND(sum(renc7)/1, 0) as renc7, ROUND(sum(real7)/1, 0) as real7,
      ROUND(sum(renc8)/1, 0) as renc8, ROUND(sum(real8)/1, 0) as real8,
      ROUND(sum(renc9)/1, 0) as renc9, ROUND(sum(real9)/1, 0) as real9,
      ROUND(sum(renc10)/1, 0) as renc10, ROUND(sum(real10)/1, 0) as real10,
      ROUND(sum(renc11)/1, 0) as renc11, ROUND(sum(real11)/1, 0) as real11,
      ROUND(sum(renc12)/1, 0) as renc12, ROUND(sum(real12)/1, 0) as real12
      FROM dashboard.rencana_real_bulanan a
      INNER JOIN dbref.t_dept_2025 b ON a.kddept=b.kddept
      ${kanwilFilter}${kddeptFilter};`;

    const encryptedQuery = Encrypt(rawQuery.replace(/\n|\s+/g, " ").trim());

    try {
      setLoading(true);
      const response = await axiosJWT.post(
        process.env.NEXT_PUBLIC_GET_REFERENSI,
        { query: encryptedQuery },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDataRencanaReal(response.data.result || []);
    } catch (err) {
      setDataRencanaReal([]);
      const { status, data } = err.response || {};
      handleHttpError(
        status,
        data?.error || "Terjadi Permasalahan Koneksi atau Server Backend"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [selectedKanwil, selectedKddept]);

  const colors = getThemeColors();
  const data = dataRencanaReal[0] || {};

  const rencana = Array.from(
    { length: 12 },
    (_, i) => (data[`renc${i + 1}`] || 0) / 1e12
  );
  const realisasi = Array.from(
    { length: 12 },
    (_, i) => (data[`real${i + 1}`] || 0) / 1e12
  );

  const series = [
    { name: "Target APBN", data: rencana },
    { name: "Realisasi APBN", data: realisasi },
  ];

  const options = {
    chart: {
      type: "area",
      stacked: true,
      animations: { speed: 300 },
      toolbar: { show: false },
      foreColor: colors.foreColor,
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => formatTrillions(value),
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agt",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ],
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
      y: { formatter: (value) => formatTrillions(value) },
    },
    colors: [colors.primary, colors.success],
    legend: {
      position: "top",
      horizontalAlign: "center",
      labels: { colors: colors.textPrimary },
      markers: { size: 8 },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    grid: { borderColor: colors.gridColor, strokeDashArray: 0 },
    stroke: { curve: "smooth" },
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardBody>
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-64 w-full" />
        </CardBody>
      </Card>
    );
  }

  if (!data.kddept) {
    return (
      <Card className="shadow-sm">
        <CardBody className="flex flex-col items-center justify-center py-12">
          <FileX className="w-12 h-12 text-default-400 mb-4" />
          <Chip
            variant="flat"
            color="warning"
            startContent={<Database className="w-3 h-3" />}
            className="text-xs"
          >
            Data Tidak Tersedia
          </Chip>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="w-full h-full">
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
}
