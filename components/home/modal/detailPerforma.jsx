"use client";

import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
} from "@heroui/react";
import { X, Search } from "lucide-react";
import { useToast } from "@/components/context/ToastContext";
import MyContext from "@/utils/Context";
import Encrypt from "@/utils/Random";

const ModalPerforma = ({ isOpen, onClose }) => {
  const [dataDipa, setDataDipa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();
  const context = useContext(MyContext);
  const { token, axiosJWT } = context;

  const formatNumber = (value) =>
    new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);

  const getData = async () => {
    const query = `
      SELECT 
        prk.kddept,
        td.nmdept,
        SUM(prk.pagu) AS pagu,
        SUM(prk.realisasi) AS realisasi,
        SUM(prk.realisasi) / NULLIF(SUM(prk.pagu), 0) * 100 AS persen
      FROM dashboard.pagu_real_kl prk
      LEFT JOIN dbref.t_dept_2025 td ON prk.kddept = td.kddept
      WHERE prk.thang = '2022' 
      GROUP BY prk.kddept
      ORDER BY pagu DESC
    `
      .replace(/\s+/g, " ")
      .trim();

    try {
      setLoading(true);
      const encryptedQuery = Encrypt(query);
      const response = await axiosJWT.post(
        `${process.env.NEXT_PUBLIC_GET_REFERENSI}`,
        { query: encryptedQuery },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultData = response.data.result || [];
      const cleanedData = resultData.map((item) => ({
        kddept: item.kddept || "",
        nmdept: item.nmdept || "",
        pagu: item.pagu || 0,
        realisasi: item.realisasi || 0,
        persen: item.persen || 0,
      }));
      setDataDipa(cleanedData);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Terjadi kesalahan saat memuat data";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) getData();
  }, [isOpen]);

  const skeletonRowCount = 8;

  const filteredData = dataDipa.filter((item) =>
    `${item.kddept} ${item.nmdept}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Detail Performa Kementerian/Lembaga</ModalHeader>
        <ModalBody className="p-4">
          <div className="mb-4">
            <Input
              placeholder="Cari Kementerian atau Kode..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Search size={18} />}
              variant="bordered"
              radius="sm"
              size="sm"
              className="w-full sm:w-1/2"
            />
          </div>
          <div className="relative min-h-[60vh] overflow-auto">
            <Table
              isStriped
              isHeaderSticky
              aria-label="Tabel Performa KL"
              removeWrapper
            >
              <TableHeader>
                {["Nama Kementerian", "Pagu", "Realisasi", "Persentase"].map(
                  (header, i) => (
                    <TableColumn
                      key={i}
                      className="top-0 z-10 bg-gradient-to-r from-blue-150 to-indigo-50 text-center font-semibold text-sm text-gray-800 border-b-2 border-blue-200 shadow-sm"
                    >
                      {header}
                    </TableColumn>
                  )
                )}
              </TableHeader>
              <TableBody>
                {(loading
                  ? Array.from({ length: skeletonRowCount }, (_, i) => ({
                      kddept: `skeleton-${i}`,
                      nmdept: "",
                      pagu: 0,
                      realisasi: 0,
                      persen: 0,
                    }))
                  : filteredData
                ).map((item) => (
                  <TableRow key={item.kddept}>
                    <TableCell className="text-left align-top">
                      {loading ? (
                        <>
                          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium">{item.nmdept}</div>
                          <div className="text-xs text-gray-500">
                            ({item.kddept})
                          </div>
                        </>
                      )}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      {loading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      ) : (
                        formatNumber(item.pagu)
                      )}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      {loading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      ) : (
                        formatNumber(item.realisasi)
                      )}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      {loading ? (
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      ) : (
                        `${Number(item.persen).toFixed(2)}%`
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            onPress={onClose}
            startContent={<X size={16} />}
          >
            Tutup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalPerforma;
