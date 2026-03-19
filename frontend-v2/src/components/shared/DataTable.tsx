"use client";

import React from "react";
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Filter,
  ArrowUpDown
} from "lucide-react";
import EmptyState from "./EmptyState";
import SkeletonTable from "./SkeletonTable";

interface Column<T> {
  header: string | React.ReactNode;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  isLoading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display at this time.",
  searchPlaceholder = "Search records...",
  onRowClick,
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  if (isLoading) return <SkeletonTable rows={pageSize} columns={columns.length} />;

  const filteredData = data?.filter((row) => {
    const searchString = searchTerm.toLowerCase();
    return Object.values(row).some(
      (val) => val && val.toString().toLowerCase().includes(searchString)
    );
  }) || [];

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-border overflow-hidden animate-in fade-in duration-500">
      {/* Table Header / Controls */}
      <div className="p-4 border-b border-border bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-white text-sm font-bold focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all placeholder:text-gray-300"
          />
        </div>
        <div className="flex items-center space-x-2">
           <button className="h-10 px-4 rounded-xl border border-border bg-white text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all flex items-center">
             <Filter className="mr-2 h-3.5 w-3.5" /> Filter
           </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-border">
              {columns.map((column, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 ${column.className || ""}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && <ArrowUpDown className="h-3 w-3 opacity-30" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`group transition-colors hover:bg-gray-50/80 ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((column, idx) => (
                    <td 
                      key={idx} 
                      className={`px-6 py-4 text-sm font-bold text-gray-700 ${column.className || ""}`}
                    >
                      {typeof column.accessor === "function" 
                        ? column.accessor(row) 
                        : (row[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="py-20 px-6">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border bg-gray-50/30 flex items-center justify-between">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg text-[10px] font-black transition-all ${
                    currentPage === page 
                    ? "bg-brand text-white shadow-lg shadow-brand/20" 
                    : "text-gray-400 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
