"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Input,
  Button,
  Spinner,
  getKeyValue,
} from "@heroui/react";
import React, {
  useContext,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import { Search } from "lucide-react";

import MyContext from "@/utils/Context";

import Encrypt from "@/utils/Random";
import { useToast } from "../context/ToastContext";

// Enhanced loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg mx-4 my-2 border border-blue-100 dark:border-blue-800">
    <div className="flex items-center space-x-4">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-indigo-600 dark:border-r-indigo-400 rounded-full animate-spin animate-reverse"></div>
      </div>
      <div className="flex space-x-1">
        <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce shadow-sm"></div>
        <div
          className="w-2.5 h-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce shadow-sm"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2.5 h-2.5 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce shadow-sm"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
      <div className="text-center">
        <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm block">
          Loading data berikutnya...
        </span>
        <span className="text-blue-500 dark:text-blue-400 text-xs">
          Mohon tunggu sebentar
        </span>
      </div>
    </div>
  </div>
);

const LIMIT = 50;

const User = forwardRef((props, ref) => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { showToast } = useToast(); // Remove type assertion
  const context = useContext(MyContext);

  // Handle case where context might be undefined during initial render
  if (!context) {
    return <div>Loading...</div>;
  }

  const { token, axiosJWT } = context; // Remove type assertion

  // --- SEARCH LOGIC FIX ---
  // Remove frontend filtering, rely on backend search only
  const fetchData = async (pageNum, search = "") => {
    const offset = (pageNum - 1) * LIMIT;
    let query = `SELECT id,username,name,email,role,kdkanwil,kdkppn,kdlokasi,active,status_update FROM v3_next.users`;
    if (search) {
      const keyword = search.toLowerCase().replace(/'/g, "''"); // escape single quotes
      query += ` WHERE (LOWER(username) LIKE '%${keyword}%' OR LOWER(name) LIKE '%${keyword}%' OR LOWER(email) LIKE '%${keyword}%' OR LOWER(role) LIKE '%${keyword}%')`;
    }
    query += ` order by role desc LIMIT ${LIMIT} OFFSET ${offset}`;

    const encryptedQuery = Encrypt(query.trim());
    try {
      if (!axiosJWT) {
        throw new Error("Network connection not available");
      }

      const res = await axiosJWT.post(
        process.env.NEXT_PUBLIC_GET_USERS ?? "",
        { query: encryptedQuery },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = res.data.result || [];
      if (result.length < LIMIT) setHasMore(false);
      if (pageNum === 1) {
        setData(result);
      } else {
        setData((prev) => [...prev, ...result]);
      }
      setIsInitialLoading(false);
    } catch (err) {
      const { data } = err.response || {};
      if (data && data.error) {
        showToast(data.error, "error");
      }
      setHasMore(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, []); // Only run on mount

  // Update handleSearch to clear data and fetch from backend
  const handleSearch = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setPage(1);
    setHasMore(true);
    setIsInitialLoading(true);
    setData([]);
    fetchData(1, newSearchTerm);
    // Reset scroll position to top when searching
    const scrollableDiv = document.getElementById("scrollableDiv");
    if (scrollableDiv) {
      scrollableDiv.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Update loadMore to support search
  const loadMore = () => {
    const nextPage = page + 1;
    fetchData(nextPage, searchTerm);
    setPage(nextPage);
  };

  const reloadData = () => {
    // Reset scroll position to top
    const scrollableDiv = document.getElementById("scrollableDiv");
    if (scrollableDiv) {
      scrollableDiv.scrollTo({ top: 0, behavior: "smooth" });
    }

    setData([]);
    setSearchTerm("");
    setPage(1);
    setHasMore(true);
    setIsInitialLoading(true);
    fetchData(1);
  };

  // Expose reloadData to parent via ref
  useImperativeHandle(ref, () => ({
    reloadData,
  }));

  const columns = [
    // { name: "ID", uid: "id" },
    { name: "Username", uid: "username" },
    { name: "Name", uid: "name" },
    { name: "Email", uid: "email" },
    { name: "Role", uid: "role" },
    { name: "Kanwil", uid: "kdkanwil" },
    { name: "KPPN", uid: "kdkppn" },
    { name: "Lokasi", uid: "kdlokasi" },
    { name: "Active", uid: "active" },
    { name: "Status", uid: "status_update" },
  ];

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasMore && !searchTerm.trim(),
    onLoadMore: loadMore,
  });

  return (
    <div className="w-full px-6 bg-slate-100 dark:bg-black animate-fade-in">
      <div className="flex flex-wrap  justify-between items-center min-h-[56px] mt-4 mb-2">
        <span className="text-2xl font-semibold">User Management</span>
        <div className="flex flex-wrap gap-4 items-center">
          <Input
            type="text"
            placeholder="Cari username, nama, email..."
            variant="faded"
            value={searchTerm}
            onChange={handleSearch}
            className="w-80 text-sm rounded-lg transition-all duration-200"
            startContent={<Search className="w-3 h-3 mr-2" />}
          />

          <div className="flex flex-row gap-3.5 flex-wrap">
            <Button
              color="primary"
              variant="ghost"
              className="min-w-[140px] flex justify-center items-center"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="ml-2">Tambah User</span>
            </Button>
            <Button
              color="success"
              variant="ghost"
              className="min-w-[140px] flex justify-center items-center"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="ml-2">Export</span>
            </Button>
            <Button
              color="primary"
              variant="faded"
              onPress={reloadData}
              className="min-w-[140px] flex justify-center items-center"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative p-0 m-0">
        <div
          id="scrollableDiv"
          className="text-center text-normal p-0 m-0 rounded-2xl bg-slate-100 shadow-none max-h-[calc(100vh-180px)] overflow-auto mb-7"
        >
          {/* Use HeroUI's useInfiniteScroll hook for infinite loading */}
          <Table
            aria-label="Daftar User"
            isHeaderSticky
            className="min-w-full shadow-none border rounded-2xl bg-slate-100"
            classNames={{
              base: "max-h-[calc(100vh-240px)] overflow-auto border rounded-2xl bg-slate-100",
              table: "",
            }}
            baseRef={scrollerRef}
            bottomContent={
              hasMore && !searchTerm.trim() ? (
                <div className="flex w-full justify-center">
                  <Spinner ref={loaderRef} color="primary" />
                </div>
              ) : null
            }
          >
            <TableHeader>
              {columns.map((col) => (
                <TableColumn
                  key={col.uid}
                  className="text-center"
                  style={{
                    width:
                      col.uid === "username"
                        ? "200px"
                        : col.uid === "name"
                        ? "250px"
                        : col.uid === "email"
                        ? "auto"
                        : col.uid === "role" ||
                          col.uid === "kdkanwil" ||
                          col.uid === "kdkppn" ||
                          col.uid === "kdlokasi" ||
                          col.uid === "active" ||
                          col.uid === "status_update"
                        ? "50px"
                        : "auto",
                  }}
                >
                  {col.name}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody
              isLoading={isInitialLoading}
              loadingContent={Array.from({ length: LIMIT }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((col, idx) => (
                    <TableCell
                      key={idx}
                      className={
                        col.uid === "role" ||
                        col.uid === "kdkanwil" ||
                        col.uid === "kdkppn" ||
                        col.uid === "kdlokasi" ||
                        col.uid === "active" ||
                        col.uid === "status_update"
                          ? "text-center"
                          : undefined
                      }
                      style={{
                        width:
                          col.uid === "username"
                            ? "200px"
                            : col.uid === "name"
                            ? "250px"
                            : col.uid === "email"
                            ? "auto"
                            : col.uid === "role" ||
                              col.uid === "kdkanwil" ||
                              col.uid === "kdkppn" ||
                              col.uid === "kdlokasi" ||
                              col.uid === "active" ||
                              col.uid === "status_update"
                            ? "50px"
                            : "auto",
                      }}
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-md animate-shimmer"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              items={data}
              emptyContent={
                searchTerm ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium mb-2">
                      Tidak ada hasil ditemukan
                    </h3>
                    <p className="text-sm">
                      Coba gunakan kata kunci pencarian yang berbeda
                    </p>
                    <p className="text-xs mt-1">Pencarian: "{searchTerm}"</p>
                  </div>
                ) : null
              }
            >
              {(user) => (
                <TableRow key={`user-${user.id}-${user.username}`}>
                  <TableCell>
                    <span className="break-all">{user.username}</span>
                  </TableCell>
                  <TableCell>
                    <span className="break-words">{user.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="break-all">{user.email}</span>
                  </TableCell>
                  <TableCell className="text-center" style={{ width: "100px" }}>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-800 dark:text-purple-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 mr-2 flex-shrink-0"></div>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-center" style={{ width: "80px" }}>
                    <span className="break-words">{user.kdkanwil}</span>
                  </TableCell>
                  <TableCell className="text-center" style={{ width: "80px" }}>
                    <span className="break-words">{user.kdkppn}</span>
                  </TableCell>
                  <TableCell className="text-center" style={{ width: "80px" }}>
                    <span className="break-words">{user.kdlokasi}</span>
                  </TableCell>
                  <TableCell className="text-center" style={{ width: "110px" }}>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md break-words ${
                        user.active
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-800 dark:text-green-300"
                          : "bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 text-red-800 dark:text-red-300"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 shadow-sm flex-shrink-0 ${
                          user.active
                            ? "bg-green-500 dark:bg-green-400 animate-pulse"
                            : "bg-red-500 dark:bg-red-400"
                        }`}
                      ></div>
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center" style={{ width: "110px" }}>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md break-words ${
                        user.status_update
                          ? "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-800 dark:text-blue-300"
                          : "bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 shadow-sm flex-shrink-0 ${
                          user.status_update
                            ? "bg-blue-500 dark:bg-blue-400 animate-pulse"
                            : "bg-gray-400 dark:bg-gray-500"
                        }`}
                      ></div>
                      {user.status_update ? "Updated" : "Pending"}
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
});

User.displayName = "UserTable";

export default User;
