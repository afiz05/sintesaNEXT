"use client";

import { useContext, useEffect, useState } from "react";
import { Autocomplete, AutocompleteItem, Skeleton } from "@heroui/react";

import { useToast } from "../context/ToastContext";
import MyContext from "@/utils/Context";
import Encrypt from "@/utils/Random";

export const Kanwil = ({
  onKanwilChange,
  selectedKanwil: propSelectedKanwil,
}) => {
  const [dataKanwil, setDataKanwil] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState(propSelectedKanwil || "00");
  const context = useContext(MyContext);
  const { showToast } = useToast();

  const { token, axiosJWT, statusLogin } = context;

  const getData = async () => {
    const encodedQuery = encodeURIComponent(
      `SELECT kdkanwil, nmkanwil FROM dbref.t_kanwil_2025 where kdkanwil<>'00' order by kdkanwil asc;`
    );
    const cleanedQuery = decodeURIComponent(encodedQuery)
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const encryptedQuery = Encrypt(cleanedQuery);

    try {
      setLoading(true);

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

      // Add "Semua Kanwil" option at the beginning
      const allKanwilOption = { kdkanwil: "00", nmkanwil: "SEMUA KANWIL" };
      const kanwilData = [allKanwilOption, ...(response.data.result || [])];
      setDataKanwil(kanwilData);
    } catch (err) {
      const { data } = err.response || {};
      showToast(data && data.error, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Sync dengan prop selectedKanwil jika berubah
  useEffect(() => {
    if (propSelectedKanwil !== undefined) {
      setSelectedKey(propSelectedKanwil);
    }
  }, [propSelectedKanwil]);

  const handleSelectionChange = (key) => {
    setSelectedKey(key);
    // Kirim nilai ke parent component melalui props callback
    if (onKanwilChange) {
      onKanwilChange(key);
    }
  };

  if (loading) {
    return <Skeleton className="w-full sm:w-44 lg:w-52 h-10 rounded-lg" />;
  }

  return (
    <Autocomplete
      placeholder="Pilih Kanwil"
      className="w-full sm:w-44 lg:w-52 h-10"
      aria-label="kanwil"
      size="md"
      variant="flat"
      color="default"
      selectedKey={selectedKey}
      onSelectionChange={(key) => handleSelectionChange(key)}
      classNames={{
        base: "rounded-lg bg-slate-50/80 dark:bg-slate-800/80",
        selectorButton:
          "rounded-lg bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 data-[hover=true]:bg-slate-100/80 dark:data-[hover=true]:bg-slate-700/80",
        listbox: "rounded-lg bg-slate-50/95 dark:bg-slate-800/95 p-2",
        popoverContent:
          "rounded-lg bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 !z-50 !mt-2 shadow-lg",
      }}
      allowsCustomValue
      defaultItems={dataKanwil}
    >
      {(item) => (
        <AutocompleteItem
          key={item.kdkanwil}
          textValue={
            item.kdkanwil === "00" ? item.nmkanwil : `${item.nmkanwil}`
          }
        >
          {item.kdkanwil === "00" ? item.nmkanwil : `${item.nmkanwil}`}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};
