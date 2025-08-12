import { useState, useEffect, useRef } from "react";
import "./Paginator.css";
import { i18n } from "../../i18n";

function Paginator({
  lastOffset,
  nextOffset,
  actualPage,
  totalPages,
  handleLastFn,
  handleNextFn,
  goToPage,
}) {
  const [pageInput, setPageInput] = useState(
    actualPage ? actualPage.toString() : ""
  );
  const [hoveringButton, setHoveringButton] = useState(false);
  const lastStableWidth = useRef("22px");

  useEffect(() => {
    setPageInput(actualPage ? actualPage.toString() : "");
  }, [actualPage]);

  const handleChange = (e) => {
    const value = e.target.value;

    if (!/^\d{0,6}$/.test(value)) return;

    const number = parseInt(value, 10);

    if (value === "") {
      setPageInput("");
      return;
    }

    try {
      if (number >= 1 && number <= totalPages) {
        setPageInput(value);
        goToPage(number);
      } else {
        setPageInput(actualPage);
      }
    } catch (error) {
      console.log(error);
      setPageInput(actualPage);
    }
  };

  const handleBlur = () => {
    if (pageInput.trim() === "") {
      setPageInput(actualPage.toString());
    }
  };

  const charWidthPx = 10;
  const basePx = 12;
  const visibleChars = Math.min(Math.max(pageInput.length, 1), 6);
  const calculatedWidth = `${basePx + visibleChars * charWidthPx}px`;

  if (!hoveringButton) {
    lastStableWidth.current = calculatedWidth;
  }

  const inputWidth = lastStableWidth.current;

  return (
    <div className="paginado d-flex align-items-center gap-2">
      <button
        className="btn btn-sm btn-outline-warning"
        onClick={handleLastFn}
        disabled={lastOffset === null}
        onMouseEnter={() => setHoveringButton(true)}
        onMouseLeave={() => setHoveringButton(false)}
      >
        &lt;
      </button>

      <span className="small no-select">
        {i18n.paginator.pageLabel}{" "}
        {totalPages >= 1 ? (
          <input
            type="text"
            className="page-input"
            value={pageInput}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={(e) => e.target.select()}
            style={{ width: inputWidth }}
          />
        ) : (
          actualPage
        )}{" "}
        {i18n.paginator.ofLabel} {totalPages}
      </span>

      <button
        className="btn btn-sm btn-outline-warning"
        onClick={handleNextFn}
        disabled={nextOffset === null}
        onMouseEnter={() => setHoveringButton(true)}
        onMouseLeave={() => setHoveringButton(false)}
      >
        &gt;
      </button>
    </div>
  );
}

export default Paginator;
