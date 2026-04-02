"use client";

import { useState, useEffect, useTransition } from "react";
import { fetchBillingStatsAction, fetchOccupancyStatsAction, fetchOperationalStatsAction } from "@/actions/report-actions";
import { Loader2, DollarSign, PieChart, Info, TrendingUp, CalendarX, TrendingDown, Users, CalendarCheck } from "lucide-react";
import { formatARS } from "@/lib/utils/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type Period = "today" | "week" | "month";

export function ReportsView() {
   const [period, setPeriod] = useState<Period>("month");
   const [activeTab, setActiveTab] = useState("billing");
   const [isPending, startTransition] = useTransition();

   const [billingData, setBillingData] = useState<any>(null);
   const [occupancyData, setOccupancyData] = useState<any>(null);
   const [operationalData, setOperationalData] = useState<any>(null);

   const loadData = () => {
      startTransition(async () => {
         if (activeTab === "billing") {
            const res = await fetchBillingStatsAction(period);
            if (res.success) setBillingData(res.data);
         } else if (activeTab === "occupancy") {
            const res = await fetchOccupancyStatsAction(period);
            if (res.success) setOccupancyData(res.data);
         } else if (activeTab === "operational") {
            const res = await fetchOperationalStatsAction(period);
            if (res.success) setOperationalData(res.data);
         }
      });
   };

   useEffect(() => { loadData(); }, [period, activeTab]);

   const renderBilling = () => {
      if (!billingData) return <SkeletonLoader />;
      return (
         <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Big Figure */}
            <div className="bg-white border rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
               <p className="text-gray-500 font-semibold mb-2">Total Facturado</p>
               <h2 className="text-5xl font-black text-green-primary">{formatARS(billingData.totalRevenue)}</h2>
               <div className="flex bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md items-center gap-1 mt-4 border border-green-100">
                  <TrendingUp className="w-3 h-3" /> Basado en pagos ingresados del periodo
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               <div className="md:col-span-2 bg-white border rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-navy mb-6">Progresión por Día</h3>
                  <div className="h-[250px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={billingData.chartData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                           <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(v) => `$${v/1000}k`} />
                           <Tooltip cursor={{fill: '#F3F4F6'}} formatter={(v: any) => formatARS(v as number)} labelStyle={{color: '#1E3A8A', fontWeight: 'bold'}} />
                           <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="bg-white border rounded-xl p-4">
                     <h3 className="font-bold text-navy mb-4 text-sm">Por Cancha</h3>
                     <div className="space-y-3">
                        {billingData.courtBreakdown.slice(0, 5).map((c: any, i: number) => (
                           <div key={i} className="flex flex-col">
                              <div className="flex justify-between items-end mb-1">
                                 <span className="text-sm font-semibold text-gray-700">{c.name}</span>
                                 <span className="text-sm text-navy font-bold">{formatARS(c.total)}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                 <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${Math.max(1, c.percentage)}%` }}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white border rounded-xl p-4">
                     <h3 className="font-bold text-navy mb-4 text-sm">Métodos de Pago</h3>
                     <ul className="space-y-2">
                        {billingData.methodBreakdown.map((m: any, i: number) => (
                           <li key={i} className="flex justify-between p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100">
                              <span className="text-sm text-gray-500 capitalize">{m.method}</span>
                              <span className="text-sm font-bold text-navy">{formatARS(m.amount)}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      );
   };

   const renderOccupancy = () => {
      if (!occupancyData) return <SkeletonLoader />;
      return (
         <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white border rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
               <p className="text-gray-500 font-semibold mb-2">Ocupación General Teórica</p>
               <h2 className="text-5xl font-black text-sky-500">{occupancyData.overallOccupancy.toFixed(1)}%</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-navy mb-6">Días más fuertes</h3>
                  <div className="h-[250px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={occupancyData.chartData}>
                           <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                           <Tooltip cursor={{fill: '#F3F4F6'}} />
                           <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                              {occupancyData.chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.count === Math.max(...occupancyData.chartData.map((d:any)=>d.count)) ? "#0284c7" : "#0ea5e9"} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="grid gap-6">
                  <div className="bg-white border rounded-xl p-4">
                     <h3 className="font-bold text-navy mb-2 flex items-center gap-2"><TrendingUp className="text-green-500 w-4 h-4"/> Horarios Pick</h3>
                     {occupancyData.topSlots.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                           {occupancyData.topSlots.map((s: any, i: number) => (
                              <div key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border">
                                 {s.time}hs ({s.count})
                              </div>
                           ))}
                        </div>
                     ) : <p className="text-sm text-gray-400">Sin datos</p>}
                  </div>

                  <div className="bg-white border rounded-xl p-4">
                     <h3 className="font-bold text-navy mb-2 flex items-center gap-2"><TrendingDown className="text-red-500 w-4 h-4"/> Horas Muertas</h3>
                     {occupancyData.bottomSlots.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                           {occupancyData.bottomSlots.map((s: any, i: number) => (
                              <div key={i} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                                 {s.time}hs ({s.count})
                              </div>
                           ))}
                        </div>
                     ) : <p className="text-sm text-gray-400">Sin datos</p>}
                  </div>
               </div>
            </div>
         </div>
      );
   };

   const renderOperational = () => {
      if (!operationalData) return <SkeletonLoader />;
      return (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
            <OpCard title="Total Reservas" value={operationalData.totalBookings} icon={CalendarCheck} color="text-sky-500" bg="bg-sky-50" />
            <OpCard title="Cancelaciones" value={`${operationalData.cancellationsCount} (${operationalData.cancellationRate.toFixed(1)}%)`} icon={CalendarX} color="text-red-500" bg="bg-red-50" />
            <OpCard title="No Shows" value={`${operationalData.noShowsCount} (${operationalData.noShowRate.toFixed(1)}%)`} icon={Users} color="text-orange-500" bg="bg-orange-50" />
            <OpCard title="Señas Pendientes" value={operationalData.pendingDepositsCount} sub={formatARS(operationalData.pendingDepositsAmount)} icon={DollarSign} color="text-yellow-600" bg="bg-yellow-50" />
            <OpCard title="Turnos Fijos Activos" value={operationalData.fixedSlotsActive} icon={CalendarCheck} color="text-green-600" bg="bg-green-50" />
         </div>
      );
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm gap-4">
            <div className="flex w-full md:w-auto bg-gray-50 p-1 rounded-lg">
               <button 
                 onClick={() => setActiveTab('billing')}
                 className={`flex-1 md:w-32 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'billing' ? 'bg-white shadow-sm text-navy' : 'text-gray-500 hover:text-navy'}`}>
                 Facturación
               </button>
               <button 
                 onClick={() => setActiveTab('occupancy')}
                 className={`flex-1 md:w-32 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'occupancy' ? 'bg-white shadow-sm text-navy' : 'text-gray-500 hover:text-navy'}`}>
                 Ocupación
               </button>
               <button 
                 onClick={() => setActiveTab('operational')}
                 className={`flex-1 md:w-32 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'operational' ? 'bg-white shadow-sm text-navy' : 'text-gray-500 hover:text-navy'}`}>
                 Operativo
               </button>
            </div>
            
            <div className="w-full md:w-48 flex items-center pr-2 relative">
               <select 
                  value={period} 
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="w-full font-semibold text-navy bg-gray-50 border border-gray-200 rounded-md p-2 outline-none appearance-none cursor-pointer"
               >
                  <option value="today">Hoy</option>
                  <option value="week">Esta Semana</option>
                  <option value="month">Este Mes</option>
               </select>
            </div>
         </div>

         <div className="min-h-[500px]">
            {activeTab === "billing" && renderBilling()}
            {activeTab === "occupancy" && renderOccupancy()}
            {activeTab === "operational" && renderOperational()}
         </div>
      </div>
   );
}

function SkeletonLoader() {
   return (
      <div className="flex items-center justify-center h-64 w-full bg-white border border-dashed border-gray-300 rounded-xl">
         <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
   );
}

function OpCard({ title, value, sub, icon: Icon, color, bg }: any) {
   return (
      <div className="bg-white border rounded-xl p-6 shadow-sm flex items-start gap-4">
         <div className={`${bg} ${color} p-3 rounded-xl`}>
            <Icon className="w-6 h-6" />
         </div>
         <div>
            <p className="text-gray-500 text-sm font-semibold">{title}</p>
            <h3 className="text-3xl font-black text-navy mt-1">{value}</h3>
            {sub && <p className="text-sm font-bold text-gray-400 mt-1">{sub}</p>}
         </div>
      </div>
   );
}
