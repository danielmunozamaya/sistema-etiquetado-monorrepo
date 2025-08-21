import "./HorizontalScrollTable.css";

interface HorizontalScrollTableProps<T> {
  rows: T[];
  columns: string[];
  beautifyColumnFn: (col: string) => string;
  handleRowClickFn: (row: T, rowNumber: number) => void;
  pipeRowValueFn: (
    col: string,
    row: T,
    index: number,
    pageOffset: number
  ) => React.ReactNode;
  pageOffset: number;
}

function HorizontalScrollTable<T>({
  rows,
  columns,
  beautifyColumnFn,
  handleRowClickFn,
  pipeRowValueFn,
  pageOffset,
}: HorizontalScrollTableProps<T>) {
  return (
    <div className="tabla-scroll">
      <table className="table table-bordered table-hover mb-0">
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th key={col}>{beautifyColumnFn(col)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((registro, index) => (
            <tr
              key={(registro as any).id ? (registro as any).id : index}
              onClick={() => handleRowClickFn(registro, index + pageOffset + 1)}
            >
              {columns.map((col, col_index) => (
                <td key={`${col}-${col_index}`}>
                  {pipeRowValueFn(col, registro, index, pageOffset) || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HorizontalScrollTable;
