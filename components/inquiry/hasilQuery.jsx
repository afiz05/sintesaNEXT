"use client";
import React, { useState, useContext, useEffect, memo } from "react";

import numeral from "numeral";
// import {
//   Modal,
//   Spinner,
//   Alert,
//   Button,
//   Form,
//   Offcanvas,
// } from "react-bootstrap";
import { Dialog, Transition } from "@headlessui/react";
import ReactPaginate from "react-paginate";
import format from "date-fns/format";
import CopyToClipboard from "react-copy-to-clipboard";
import DataExport from "./formatCSV";
// import "../../layout/layout.css";
import Encrypt from "../../utils/Encrypt";
import { handleHttpError } from "../notifikasi/toastError";
// import { LoadingChart } from "../../layoutlama/LoadingTable";
// import ModalAnalisa from "../ai/ModalAnalisa";
import MyContext from "../../utils/Context";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  Spinner,
  Button,
} from "@heroui/react";

const HasilQuery = (props) => {
  const { showModal, closeModal, openModalKedua, closeModalKedua } = props;
  const { axiosJWT, token, username, verified } = useContext(MyContext);
  const [loading, setLoading] = useState(false);

  const [sql] = useState(props.query);
  const [data, setData] = useState([]);
  const [dataerror, setError] = useState("");
  const [dataerr, setErr] = useState(false);
  const [fulls, setFulls] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [msg, setMsg] = useState("");
  const [fit, setFit] = useState("table-scroll");
  const [totPagu, settotPagu] = useState(0);
  const [totReal, settotReal] = useState(0);
  const [totBlokir, settotBlokir] = useState(0);

  useEffect(() => {
    sql && getData();
  }, [sql, page]);

  function full(event) {
    const isChecked = event.target.checked;
    // setFulls(isChecked);
    // isChecked ? setFit("table-scroll2") : setFit("table-scroll2");
  }
  console.log(token);

  const getData = async () => {
    setError("");
    setErr(false);
    setLoading(true);
    const encodedQuery = encodeURIComponent(sql);
    const encryptedQuery = Encrypt(encodedQuery);

    try {
      const response = await axiosJWT.get(
        process.env.NEXT_PUBLIC_LOCAL_INQUIRY
          ? `${process.env.NEXT_PUBLIC_LOCAL_INQUIRYBELANJA}${encryptedQuery}&page=${page}&limit=${limit}&user=${username}`
          : "",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(encryptedQuery);

      setData(response.data.result.filter((item) => item.kddept !== "000"));
      setPages(response.data.totalPages);
      setRows(response.data.totalRows);
      settotPagu(response.data.totalPagu);
      settotReal(response.data.totalRealisasi);
      settotBlokir(response.data.totalBlokir);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      const { status, data } = error.response || {};
      handleHttpError(
        status,
        (data && data.error) ||
          "Terjadi Permasalahan Koneksi atau Server Backend"
      );
    }
  };

  const tutupModal = () => {
    closeModal();
  };

  const columns = Object.keys(data[0] || {});
  const jumlahKolom = Object.keys(data[0] || {}).length;
  const columnTotalSums = new Array(3).fill(0);

  data.forEach((row) => {
    for (
      let cellIndex = jumlahKolom - 3;
      cellIndex < jumlahKolom;
      cellIndex++
    ) {
      columnTotalSums[cellIndex - (jumlahKolom - 3)] += Number(
        row[Object.keys(row)[cellIndex]]
      );
    }
  });

  const changePage = ({ selected }) => {
    setPage(selected);
    //  console.log(selected);
    // setFulls(true);
    // setFit("table-scroll2");
    if (selected === 9) {
      setMsg(
        "Jika tidak menemukan data yang Anda cari, silahkan cari data dengan kata kunci spesifik!"
      );
    } else {
      setMsg("");
    }
  };
  const [buka, setBuka] = useState(false);
  const handleBukaChange = (newValue) => {
    setBuka(newValue);

    // console.log("Status buka dari komponen anak:", newValue);
  };
  return (
    <>
      {dataerror ? (
        <>
          {tutupModal()}
          {/* {<ToastError message={dataerror} />} */}
        </>
      ) : null}

      <Modal
        isOpen={showModal}
        onClose={tutupModal}
        size="5xl"
        scrollBehavior="inside"
        isDismissable={true}
        isKeyboardDismissDisabled={false}
        classNames={{
          wrapper: "modal-wrapper",
          base: "modal-content",
        }}
      >
        <ModalContent>
          {/* <ModalBody closeButton>
          <div style={{ fontSize: "15px" }}>
            {/* <span>
              <Form.Check
                inline
                className="fw-normal mx-2 text-dark"
                type="checkbox"
                label="Full Screen"
                onChange={full}
                checked={fulls}
              />
            </span> */}
          {/* <span>
              <h4>Inquiry Pagu dan Realisasi</h4>
            </span>
          </div>
        </ModalHeader>  */}

          <ModalBody>
            <>
              {loading && (
                <div className="loading-container">
                  {/* <Loading2/> */}
                  <Spinner
                    className="loading-spinner"
                    size="md"
                    color="primary"
                  />
                </div>
              )}
              {rows === 0 ? (
                <>
                  {!loading && (
                    <p
                      className="text-danger text-center fw-bold position-absolute"
                      style={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <i
                        className="bi bi-emoji-dizzy-fill"
                        style={{ fontSize: "30px" }}
                      ></i>
                      <br /> Data Tidak Ditemukan
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="d-flex justify-content-between my-2">
                    <div>
                      <Tgupdate thang={props.thang} />
                    </div>

                    {/* <div className="d-flex align-items-center">
                    {buka && (
                      <Button variant="danger" size="sm" className="w-100 p-1">
                        Analisa
                      </Button>
                    )}
                  </div> */}

                    <div>
                      <DataExport
                        data={data}
                        filename="data.csv"
                        className="me-2"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={fit}>
                <table
                  className="table  table-hover table-responsive "
                  width="100%"
                >
                  <thead>
                    <tr>
                      {data.length > 0 && <th className="text-header">No</th>}
                      {columns.map((column, index) => (
                        <th key={index} className="text-header">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {data
                      .filter((item) => item.kddept !== "000")
                      .map((row, index) => (
                        <tr key={index}>
                          <td className="text-tengah">
                            {index + 1 + page * limit}
                          </td>
                          {Object.values(row).map((cell, index) => (
                            <React.Fragment key={index}>
                              {index > jumlahKolom - 4 ? (
                                <td className="text-kanan">
                                  {numeral(cell).format("0,0")}
                                </td>
                              ) : (
                                <td className="text-tengah">{cell}</td>
                              )}
                            </React.Fragment>
                          ))}
                        </tr>
                      ))}
                  </tbody>

                  {jumlahKolom !== 0 && (
                    <tfoot>
                      <tr>
                        <td
                          className="text-end baris-total"
                          colSpan={jumlahKolom - 2}
                        >
                          SUB TOTAL
                        </td>
                        {columnTotalSums.map((total, totalIndex) => (
                          <td key={totalIndex} className="text-end baris-total">
                            {numeral(total).format("0,0")}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td
                          className="text-end baris-total fw-bold"
                          colSpan={jumlahKolom - 2}
                        >
                          TOTAL
                        </td>
                        <td className="text-end baris-total fw-bold">
                          {numeral(totPagu).format("0,0")}
                        </td>
                        <td className="text-end baris-total fw-bold">
                          {numeral(totReal).format("0,0")}
                        </td>
                        <td className="text-end baris-total fw-bold">
                          {numeral(totBlokir).format("0,0")}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </>

            {data.length > 0 && (
              <>
                <div className="pagination justify-content-between mt-2 text-dark">
                  <span>
                    Total : {numeral(rows).format("0,0")}, &nbsp; Hal :{" "}
                    {rows ? page + 1 : 0} dari {pages}
                  </span>
                  <nav>
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel="›"
                      onPageChange={changePage}
                      pageRangeDisplayed={3}
                      marginPagesDisplayed={1}
                      pageCount={pages}
                      previousLabel="‹"
                      renderOnZeroPageCount={null}
                      containerClassName="justify-content-center pagination"
                      previousClassName="page-item"
                      previousLinkClassName="page-link"
                      nextClassName="page-item"
                      nextLinkClassName="page-link"
                      pageClassName="page-item"
                      pageLinkClassName="page-link"
                      breakClassName="page-item"
                      breakLinkClassName="page-link"
                      activeClassName="active"
                      disabledClassName="disabled"
                    />
                  </nav>{" "}
                </div>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* <ModalAnalisa
        showModalAnalisa={openModalKedua}
        closeModalAnalisa={closeModalKedua}
        onBukaChange={handleBukaChange}
        buka={buka}
        data={
          data && {
            ...data,
            totalPagu: totPagu,
            totalReal: totReal,
            totalBlokir: totBlokir,
          }
        }
        loading={loading}
      /> */}
    </>
  );
};

function Tgupdate(props) {
  const { axiosJWT, token } = useContext(MyContext);
  const [dataupdate, setDataupdate] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    props.thang && getUpdate();
  }, []);

  const getUpdate = async () => {
    setLoading(true);
    try {
      const response = await axiosJWT.get(
        process.env.NEXT_PUBLIC_LOCAL_TGUPDATE
          ? `${process.env.NEXT_PUBLIC_LOCAL_TGUPDATE}?thang=${props.thang}`
          : "",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
      setDataupdate(response.data);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        "Loading ..."
      ) : (
        <span style={{ fontSize: "13px" }} className="bg-dark text-white p-1">
          {dataupdate.map((row, index) => (
            <React.Fragment key={index}>
              {`data update s.d ${format(
                new Date(row.tgupdate),
                "dd-MM-yyyy"
              )}`}
            </React.Fragment>
          ))}
        </span>
      )}
    </>
  );
}

const Sql = (props) => {
  const { showModalsql, closeModalsql } = props;
  const [loading, setLoading] = useState(false);

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
  };

  const tutupModalsql = () => {
    closeModalsql();
    setIsCopied(false);
  };

  return (
    <>
      <Modal
        isOpen={showModalsql}
        onClose={tutupModalsql}
        size="5xl"
        scrollBehavior="inside"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          <ModalBody>
            {loading ? (
              <div className="text-center"></div>
            ) : (
              <>
                <div
                  className="bg-success-50 border border-success-200 text-success-800 text-center rounded-lg p-5"
                  style={{
                    overflowY: "scroll",
                    minWidth: "300px",
                    padding: "20px",
                  }}
                >
                  {props.query2}{" "}
                </div>
                <div className="text-center">
                  <CopyToClipboard text={props.query2} onCopy={handleCopy}>
                    <Button color="primary" size="sm" className="w-25 me-2">
                      Copy to Clipboard
                    </Button>
                  </CopyToClipboard>
                  {isCopied ? (
                    <span style={{ color: "green" }}>Copied!</span>
                  ) : null}
                </div>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export { HasilQuery, Tgupdate, Sql };
