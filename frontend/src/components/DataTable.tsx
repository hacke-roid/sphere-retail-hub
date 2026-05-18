import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

export type TableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
};

type DataTableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T;
  total?: number;
  page?: number;
  limit?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  renderActions?: (row: T) => ReactNode;
};

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  total = data.length,
  page = 1,
  limit = data.length,
  onNext,
  onPrevious,
  renderActions,
}: DataTableProps<T>) => {
  const start = data.length ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, total);

  return (
    <section className="data-table-card">
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`text-${column.align || "left"}`}
                >
                  {column.header}
                </th>
              ))}

              {renderActions && <th className="text-center">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="data-table-empty"
                >
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={String(row[rowKey])}>
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`text-${column.align || "left"}`}
                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.key as keyof T] ?? "-")}
                    </td>
                  ))}

                  {renderActions && (
                    <td className="text-center">{renderActions(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="data-table-footer">
        <p>
          Showing {start}-{end} of {total} records
        </p>

        <div className="pagination-actions">
          <button type="button" disabled={page <= 1} onClick={onPrevious}>
            Previous
          </button>

          <button type="button" disabled={end >= total} onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default DataTable;

export const DefaultActionButton = () => {
  return (
    <button className="action-button" type="button">
      <MoreHorizontal size={22} />
    </button>
  );
};
