"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Download, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { useTables, useCreateTable, useDeleteTable } from "@/hooks/useTables";
import AuthGuard from "@/components/auth/AuthGuard";
import { Role } from "@/types";

export default function QrCodesPage() {
  const [tableNumber, setTableNumber] = useState("");
  const { data: tables, isLoading } = useTables();
  const createTable = useCreateTable();
  const deleteTable = useDeleteTable();

  const handleGenerate = async () => {
    if (!tableNumber) return toast.error("Please enter a table number");
    
    // Add leading zero if needed (e.g., table "5" becomes "05")
    const formattedTableNumber = tableNumber.padStart(2, "0");
    
    createTable.mutate({ table_number: formattedTableNumber }, {
      onSuccess: () => {
        setTableNumber("");
        toast.success(`QR generated for Table ${formattedTableNumber}`);
      }
    });
  };

  const downloadQR = (id: string, table: string) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `table-${table}-qr.png`;
      link.href = url;
      link.click();
    }
  };

  const getFullUrl = (table: string) => {
    const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : "";
    return `${baseUrl}/menu/${table.replace(/^0+/, '')}`;
  };

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER]}>
      <div className="space-y-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Table QR Management</h1>
            <p className="text-sm text-gray-500 font-medium tracking-wide">Generate and manage QR codes for table-side ordering.</p>
          </div>
          
          <div className="flex items-center space-x-3 bg-white p-2 rounded-xl shadow-sm border border-border">
            <input 
              type="number" 
              placeholder="Table #" 
              className="w-24 h-10 px-3 rounded-lg border border-border bg-gray-50 text-sm font-black focus:border-brand focus:ring-0 outline-none transition-all"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              disabled={createTable.isPending}
              className="flex items-center rounded-lg bg-brand px-5 py-3 text-xs font-black text-white shadow-lg shadow-brand/20 hover:bg-brand-hover tracking-widest uppercase transition-all disabled:opacity-50"
            >
              {createTable.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Generate
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-brand animate-spin mb-4" />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading stored tables...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {tables?.map((qr) => (
              <div key={qr.id} className="group relative bg-white rounded-2xl shadow-card border border-border p-6 flex flex-col items-center transition-all hover:border-brand hover:shadow-xl hover:-translate-y-1">
                <div className="h-10 w-10 absolute -top-4 -left-4 bg-brand text-white rounded-xl shadow-lg flex items-center justify-center text-sm font-black z-10">
                  {qr.table_number}
                </div>
                
                <div className="w-full aspect-square bg-white border border-border rounded-xl flex items-center justify-center p-4 relative">
                  <QRCodeCanvas
                    id={qr.id}
                    value={getFullUrl(qr.table_number)}
                    size={200}
                    level={"H"}
                    includeMargin={true}
                    className="h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center">
                     <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase text-gray-400">Scan Preview</p>
                       <Link href={`/menu/${qr.table_number.replace(/^0+/, '')}`} target="_blank" className="flex items-center mx-auto text-brand font-black text-[10px] uppercase tracking-widest hover:underline">
                          <ExternalLink className="mr-1.5 h-3 w-3" /> Test Link
                       </Link>
                     </div>
                  </div>
                </div>
                
                <div className="mt-6 w-full space-y-3">
                  <div className="text-center">
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Table {qr.table_number}</p>
                    <p className="text-[9px] text-gray-400 font-bold truncate mt-1">/menu/{qr.table_number.replace(/^0+/, '')}</p>
                  </div>
                  
                  <div className="flex space-x-2 pt-2 border-t border-border">
                    <button 
                      onClick={() => downloadQR(qr.id, qr.table_number)}
                      className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-surface text-gray-600 hover:text-brand hover:bg-brand/5 transition-all"
                      title="Download PNG"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteTable.mutate(qr.id)}
                      disabled={deleteTable.isPending}
                      className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-surface text-gray-400 hover:text-danger hover:bg-danger/5 transition-all disabled:opacity-50"
                    >
                      {deleteTable.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Empty state if no tables */}
            {!tables?.length && (
              <div className="col-span-full rounded-2xl border-4 border-dashed border-gray-100 flex flex-col items-center justify-center p-20 text-center bg-gray-50/30">
                 <div className="h-20 w-20 rounded-full border-4 border-gray-100 flex items-center justify-center text-gray-200 mb-6">
                    <Plus className="h-10 w-10" />
                 </div>
                 <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No tables registered yet</p>
                 <p className="text-[10px] text-gray-400 font-bold mt-2 max-w-[200px]">Enter a table number above to generate your first permanent QR code.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Information Section */}
        <div className="rounded-2xl bg-sidebar p-10 text-white shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl group-hover:bg-brand/20 transition-all duration-700" />
          
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Print & Deploy</h3>
            <p className="text-sm font-medium text-sidebar-text leading-relaxed">
              Download your QR codes as high-resolution PNGs ready for printing. Place them on your tables, bar counters, or takeaway windows. Customers can simply scan with their phone camera to browse your digital menu and place orders instantly.
            </p>
            <div className="mt-8 flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-brand" />
                <span className="text-[10px] font-black uppercase tracking-widest text-sidebar-text">Digital Menu Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-brand" />
                <span className="text-[10px] font-black uppercase tracking-widest text-sidebar-text">Real-time Ordering</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
