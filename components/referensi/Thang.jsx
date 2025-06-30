"use client";

import { useContext, useEffect, useState } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";

export const Thang = () => {
  const [selectedKey, setSelectedKey] = useState("2025");

  // Data tahun hanya 2025
  const dataTahun = [{ kode: "2025", tahun: "2025" }];

  return (
    <Autocomplete
      placeholder="Pilih Tahun"
      className="w-full sm:w-44 lg:w-52 h-10"
      aria-label="thang"
      size="md"
      variant="flat"
      color="default"
      selectedKey={selectedKey}
      onSelectionChange={(key) => setSelectedKey(key)}
      classNames={{
        base: "rounded-lg bg-slate-50/80 dark:bg-slate-800/80",
        selectorButton:
          "rounded-lg bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 data-[hover=true]:bg-slate-100/80 dark:data-[hover=true]:bg-slate-700/80",
        listbox: "rounded-lg bg-slate-50/95 dark:bg-slate-800/95",
        popoverContent:
          "rounded-lg bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60",
      }}
      allowsEmptyCollection={false}
      defaultItems={dataTahun}
    >
      {(item) => (
        <AutocompleteItem key={item.kode}>{item.tahun}</AutocompleteItem>
      )}
    </Autocomplete>
  );
};
