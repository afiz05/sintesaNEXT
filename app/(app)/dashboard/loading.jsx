"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Skeleton,
} from "@heroui/react";

import dynamic from "next/dynamic";
import { AlertTriangle, BarChart3, CheckCircle2, Clock } from "lucide-react";
import NextLink from "next/link";
import { Thang } from "../../../components/referensi/Thang";
import { Kddept } from "../../../components/referensi/Kddept";
import { Kanwil } from "../../../components/referensi/Kanwil";
import { GetDipa } from "../../../components/home/dataDipa/getDipa";
import { BelanjaTerbesar } from "../../../components/home/dataDipa/BelanjaTerbesar";
import PerformaTerbesar from "../../../components/home/dataDipa/PerformaTerbesar";
import { Fungsi } from "../../../components/charts/fungsi";

const DukmanTeknis = dynamic(
  () =>
    import("../../../components/charts/dukmanTeknis").then((module) => ({
      default: module.DukmanTeknis,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-64" />,
  }
);

const realizationProgramData = [
  { name: "Infrastruktur", pagu: 450, realisasi: 390 },
  { name: "Pendidikan", pagu: 380, realisasi: 342 },
  { name: "Kesehatan", pagu: 320, realisasi: 294 },
  { name: "Sosial", pagu: 280, realisasi: 268 },
  { name: "Pertahanan", pagu: 250, realisasi: 218 },
  { name: "Ekonomi", pagu: 220, realisasi: 210 },
];

const recentActivities = [
  {
    title: "Pencairan Anggaran Pendidikan",
    ministry: "Kemendikbud",
    amount: "Rp 125.4 M",
    time: "2 jam lalu",
    status: "completed",
  },
  {
    title: "Revisi DIPA Kesehatan",
    ministry: "Kemenkes",
    amount: "Rp 89.2 M",
    time: "4 jam lalu",
    status: "pending",
  },
  {
    title: "Penyesuaian Alokasi PUPR",
    ministry: "Kemen PUPR",
    amount: "Rp 67.8 M",
    time: "6 jam lalu",
    status: "in-review",
  },
];

export default function DashboardLoading() {
  const { theme } = useTheme();
  const [selectedKanwil, setSelectedKanwil] = useState("00");
  const [selectedKddept, setSelectedKddept] = useState("000");

  // Handler untuk menerima perubahan nilai kanwil dari komponen Kanwil
  const handleKanwilChange = (kanwilValue) => {
    setSelectedKanwil(kanwilValue);
  };

  // Handler untuk menerima perubahan nilai kddept dari komponen Kddept
  const handleKddeptChange = (kddeptValue) => {
    setSelectedKddept(kddeptValue);
  };

  // Theme-aware class function
  const getCardClasses = () => {
    const isDark = theme === "dark";
    return isDark
      ? "bg-gradient-to-br from-slate-800 to-slate-700"
      : "bg-gradient-to-br from-slate-100 to-slate-200";
  };

  const cardClasses = getCardClasses();

  const TrenApbn = dynamic(
    () => import("../../../components/charts/trenApbn"),
    {
      ssr: false,
      loading: () => <Skeleton className="w-full h-64" />,
    }
  );

  return (
    <div className="h-full lg:px-6 pt-4">
      {/* Header Section Skeleton */}
      <div className="flex flex-col gap-2 pt-2 px-4 lg:px-0 max-w-[90rem] mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            {" "}
            <h1 className="text-xl md:text-2xl font-medium text-foreground tracking-wide">
              Dashboard Realisasi APBN
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Thang />
            <Kddept
              onKddeptChange={handleKddeptChange}
              selectedKddept={selectedKddept}
            />
            <Kanwil
              onKanwilChange={handleKanwilChange}
              selectedKanwil={selectedKanwil}
            />
          </div>
        </div>

        {/* Quick Stats Cards Skeleton */}
        <GetDipa
          selectedKanwil={selectedKanwil}
          selectedKddept={selectedKddept}
        />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="flex flex-col gap-6 pt-6 px-4 lg:px-0 max-w-[90rem] mx-auto w-full">
        {/* Three Card Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-12 gap-6">
          {/* Overall Summary Skeleton */}
          <BelanjaTerbesar
            selectedKanwil={selectedKanwil}
            selectedKddept={selectedKddept}
          />

          {/* Ministry Performance Skeleton */}
          <PerformaTerbesar
            selectedKanwil={selectedKanwil}
            selectedKddept={selectedKddept}
          />

          {/* Chart Skeleton */}
          {/* <Card className="border-none shadow-sm bg-gradient-to-br from-default-50 to-default-100 lg:col-span-12 xl:col-span-6">
            <CardHeader className="pb-2 px-4 md:px-6">
              <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-5 md:h-6 w-48 rounded" />
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <Skeleton className="h-3 md:h-4 w-40 rounded" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-2 pb-2">
              <div className="h-[200px] md:h-[280px] w-full flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            </CardBody>
          </Card> */}
          <Card
            className={`border-none shadow-sm ${cardClasses} sm:col-span-2 lg:col-span-12 xl:col-span-6`}
          >
            <CardHeader className="pb-1 px-4 md:px-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm md:text-base font-semibold">
                  Tren Realisasi APBN
                </h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-2 md:px-4 pb-1">
              <div className="h-[150px] md:h-[200px] w-full flex flex-col overflow-hidden">
                <TrenApbn
                  selectedKanwil={selectedKanwil}
                  selectedKddept={selectedKddept}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Realisasi Fungsi Chart */}
          <Card
            className={`border-none shadow-sm ${cardClasses} lg:col-span-2`}
          >
            <CardHeader className="pb-2 px-4 md:px-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3 w-3 text-default-500" />
                  <h3 className="text-sm md:text-base font-semibold">
                    Realisasi Fungsi
                  </h3>
                </div>
                <Chip
                  color="primary"
                  variant="flat"
                  size="sm"
                  className="w-fit"
                >
                  Per Sektor
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-2 md:px-4 pb-1">
              <div className="h-[200px] md:h-[250px] w-full flex flex-col overflow-hidden">
                <Fungsi
                  selectedKanwil={selectedKanwil}
                  selectedKddept={selectedKddept}
                />
              </div>
            </CardBody>
          </Card>

          {/* Pagu Dukman vs Teknis Chart */}
          <Card className={`border-none shadow-sm ${cardClasses}`}>
            <CardHeader className="pb-2 px-4 md:px-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3 w-3 text-default-500" />
                  <h3 className="text-sm md:text-base font-semibold">
                    Pagu Dukman vs Teknis
                  </h3>
                </div>
                <Chip
                  color="primary"
                  variant="flat"
                  size="sm"
                  className="w-fit"
                >
                  2024
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-2 md:px-4 pb-1">
              <div className="h-[200px] md:h-[250px] w-full flex flex-col overflow-hidden">
                <DukmanTeknis
                  selectedKanwil={selectedKanwil}
                  selectedKddept={selectedKddept}
                />
              </div>
            </CardBody>
          </Card>
          <Card className={`border-none shadow-sm ${cardClasses}`}>
            <CardHeader className="pb-2 px-4 md:px-6">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-default-500" />
                <h3 className="text-sm md:text-base font-semibold">
                  Aktivitas Terkini
                </h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-4 md:px-6">
              <div className="space-y-2">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {activity.status === "completed" ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : activity.status === "pending" ? (
                        <Clock className="h-3 w-3 text-warning" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-default-500">
                        {activity.ministry}
                      </p>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className="text-xs font-medium text-primary">
                          {activity.amount}
                        </span>
                        <span className="text-xs text-default-400">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Divider className="my-2" />
              <Button
                variant="flat"
                color="primary"
                size="sm"
                className="w-full"
                as={NextLink}
                href="/mbg/kertas-kerja"
              >
                Lihat Semua Aktivitas
              </Button>
            </CardBody>
          </Card>
        </div>
        {/* Bottom Row Skeleton */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-default-50 to-default-100">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-5 md:h-6 w-32 rounded" />
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-4 md:px-6">
              <div className="space-y-3 md:space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <Skeleton className="h-4 w-4 rounded flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-48 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-20 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="my-4">
                <Skeleton className="h-px w-full rounded" />
              </div>
              <Skeleton className="h-8 w-full rounded-lg" />
            </CardBody>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-default-50 to-default-100">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
              <Skeleton className="h-5 md:h-6 w-24 rounded" />
            </CardHeader>
            <CardBody className="pt-0 space-y-3 px-4 md:px-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full rounded-lg" />
              ))}
            </CardBody>
          </Card>
        </div> */}
      </div>
    </div>
  );
}
