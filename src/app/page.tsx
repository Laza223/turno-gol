import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Calendar, Wallet, Smartphone, ShieldAlert, BookOpen, UserX, CheckCircle2, RefreshCw, BarChart3, Goal, Play, ChevronRight, Lock, MessageCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      
      {/* ----------------- HERO SECTION ----------------- */}
      <section className="bg-navy pt-20 pb-24 md:pt-32 md:pb-32 px-5 relative overflow-hidden text-center md:text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-800 text-blue-200 text-sm font-semibold mb-2">
               <Goal className="w-4 h-4" /> Nuevo sistema 2025
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              TurnoGol ⚽
            </h1>
            <p className="text-2xl md:text-3xl font-medium text-blue-100/90 leading-tight">
              El sistema que ordena tu complejo de fútbol.
            </p>
            <p className="text-lg md:text-xl text-blue-200/80 max-w-lg mx-auto md:mx-0">
              Gestioná reservas, señas, turnos fijos y la caja diaria desde un solo lugar. Simple, rápido y seguro.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-yellow-accent text-navy hover:bg-yellow-400 font-bold text-lg rounded-xl shadow-[0_0_40px_rgba(250,204,21,0.3)] transition-all hover:scale-105">
                  Probalo gratis 14 días
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 h-14 px-8 text-lg rounded-xl">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md relative select-none group">
             {/* Decorational glow */}
             <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
             
             {/* Mockup Grilla UI */}
             <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-center px-2 pb-2 border-b border-white/10">
                   <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full bg-red-400"></span>
                     <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                     <span className="w-3 h-3 rounded-full bg-green-400"></span>
                   </div>
                   <div className="text-white/50 text-xs font-mono">14 de Junio</div>
                </div>
                
                {/* Mockup rows */}
                <div className="bg-white/10 rounded-lg p-3 flex justify-between items-center border border-white/5">
                   <div className="text-blue-100 font-bold text-sm">18:00 hs</div>
                   <div className="bg-green-primary/80 border border-green-primary px-3 py-1 rounded-md text-white text-xs font-bold">Pagado</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex justify-between items-center border border-white/5">
                   <div className="text-blue-100 font-bold text-sm">19:00 hs</div>
                   <div className="text-xs font-bold text-white/50 border border-dashed border-white/20 px-3 py-1 rounded-md">Disponible</div>
                </div>
                <div className="bg-blue-500/20 border-l-4 border-blue-400 rounded-r-lg p-3 flex justify-between items-center">
                   <div className="text-blue-100 font-bold text-sm">20:00 hs</div>
                   <div className="text-blue-200 text-xs font-bold flex flex-col items-end">
                      <span>FIJO: Los Pibes</span>
                      <span className="text-[10px] opacity-70">Debe seña</span>
                   </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex justify-between items-center border border-white/5">
                   <div className="text-blue-100 font-bold text-sm">21:00 hs</div>
                   <div className="bg-orange-500/80 border border-orange-500 px-3 py-1 rounded-md text-white text-xs font-bold">Bloqueado</div>
                </div>
             </div>
          </div>
          
        </div>
      </section>

      {/* ----------------- PROBLEMA SECTION ----------------- */}
      <section className="py-24 px-5 bg-gray-50 border-b border-gray-100">
         <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy mb-4">¿Te pasa esto seguido?</h2>
            <p className="text-lg text-gray-500 mb-16 max-w-2xl mx-auto">Manejar todo manual es un dolor de cabeza. Seguro alguna de estas situaciones te resulta familiar.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
               <PainCard icon={Smartphone} title="WhatsApp colapsado" desc="Respondés a toda hora si hay turnos libres y no das abasto." />
               <PainCard icon={ShieldAlert} title="Señas perdidas" desc="Gente que no paga, confirmás igual, y no vienen." />
               <PainCard icon={BookOpen} title="Cuaderno desordenado" desc="Tachones, doble reservas en la misma cancha y estrés." />
               <PainCard icon={UserX} title="Control nulo" desc="Falta de caja diaria clara y plata que no sabés dónde está." />
            </div>
         </div>
      </section>

      {/* ----------------- SOLUCION / FEATURES ----------------- */}
      <section className="py-24 px-5 bg-white">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-extrabold text-navy mb-4">TurnoGol resuelve todo eso</h2>
               <p className="text-lg text-gray-500 max-w-2xl mx-auto">Herramientas pensadas específicamente para complejos deportivos argentinos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <FeatureCard icon={Calendar} title="Grilla de Turnos" desc="Visualizá todas tus canchas en un calendario limpio. Ocupá bloqueando y reservando en 1 click." />
               <FeatureCard icon={Wallet} title="Señas automáticas" desc="Cobrá mediante MercadoPago. Si no pagan la seña en el tiempo definido, el turno se libera solo." />
               <FeatureCard icon={RefreshCw} title="Turnos Fijos" desc="Agendá al equipo de los jueves y el sistema proyecta las próximas 4 semanas sin que hagas nada." />
               <FeatureCard icon={MessageCircle} title="Mensajes de WhatsApp" desc="Mandá recordatorios de turnos, confirmaciones o reclamos de pago con plantillas prearmadas." />
               <FeatureCard icon={Lock} title="Caja Diaria Bóveda" desc="Registrá todo el efectivo y transferencias. Protegido por PIN para evitar alteraciones del personal." />
               <FeatureCard icon={BarChart3} title="Reportes y Métricas" desc="Entendé qué cancha rinde más, qué horarios están muertos y cuánto facturás realmente." />
            </div>
         </div>
      </section>

      {/* ----------------- COMO FUNCIONA ----------------- */}
      <section className="py-20 px-5 bg-navy text-center relative">
         <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-12">¿Cómo empiezo?</h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 relative z-10">
               
               <Step number="1" title="Registrate" desc="Completá tus datos iniciales." />
               <ChevronRight className="w-8 h-8 text-blue-500 hidden md:block opacity-50" />
               <div className="w-8 h-8 md:hidden relative -mt-4"><ChevronRight className="w-8 h-8 text-blue-500 opacity-50 rotate-90 mx-auto" /></div>
               
               <Step number="2" title="Configurá" desc="Cargá tus canchas, precios y MercadoPago." />
               <ChevronRight className="w-8 h-8 text-blue-500 hidden md:block opacity-50" />
               <div className="w-8 h-8 md:hidden relative -mt-4"><ChevronRight className="w-8 h-8 text-blue-500 opacity-50 rotate-90 mx-auto" /></div>

               <Step number="3" title="Empezá" desc="Compartí el link de reservas a tus clientes." />
            </div>
         </div>
      </section>

      {/* ----------------- PRECIOS ----------------- */}
      <section className="py-24 px-5 bg-gray-50 items-center justify-center relative">
         <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-extrabold text-navy mb-4">Planes simples y sin sorpresas</h2>
               <p className="text-lg text-gray-500">Todo el esfuerzo de tu negocio condensado al valor de un solo turno.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
               
               {/* Plan Cancha */}
               <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-navy mb-2">Plan Base</h3>
                    <p className="text-gray-500 text-sm mb-6">Ideal para complejos chicos y canchas que recién arrancan.</p>
                    <div className="mb-6">
                       <span className="text-5xl font-extrabold text-navy">$47.900</span><span className="text-gray-500">/mes</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                       <li className="flex items-center gap-3 text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-green-primary shrink-0" /> Gestión hasta 3 canchas
                       </li>
                       <li className="flex items-center gap-3 text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-green-primary shrink-0" /> Cobro de señas (MercadoPago)
                       </li>
                       <li className="flex items-center gap-3 text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-green-primary shrink-0" /> Base de clientes
                       </li>
                       <li className="flex items-center gap-3 text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-green-primary shrink-0" /> Turnos fijos automatizados
                       </li>
                    </ul>
                  </div>
                  <Link href="/register">
                     <Button variant="outline" size="lg" className="w-full h-14 border-blue-200 hover:bg-blue-50 text-navy font-bold text-md rounded-xl">
                        Elegir Plan Base
                     </Button>
                  </Link>
               </div>

               {/* Plan Complejo (PRO) */}
               <div className="bg-navy rounded-3xl p-8 border border-blue-800 shadow-xl flex flex-col justify-between relative transform md:-translate-y-4">
                  <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-4">
                     <span className="bg-yellow-accent text-navy text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-lg -rotate-6 block">
                        🎁 14 Días Gratis
                     </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Plan Pro</h3>
                    <p className="text-blue-200/80 text-sm mb-6">El ecosistema completo para volúmenes altos y bóveda estricta.</p>
                    <div className="mb-6">
                       <span className="text-5xl font-extrabold text-white">$73.900</span><span className="text-blue-200">/mes</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                       <li className="flex items-center gap-3 text-white">
                          <CheckCircle2 className="w-5 h-5 text-yellow-accent shrink-0" /> Canchas ilimitadas
                       </li>
                       <li className="flex items-center gap-3 text-white">
                          <CheckCircle2 className="w-5 h-5 text-yellow-accent shrink-0" /> Todo lo de Plan Base
                       </li>
                       <li className="flex items-center gap-3 text-white">
                          <CheckCircle2 className="w-5 h-5 text-yellow-accent shrink-0" /> Caja Diaria protegida (PIN)
                       </li>
                       <li className="flex items-center gap-3 text-white">
                          <CheckCircle2 className="w-5 h-5 text-yellow-accent shrink-0" /> Estadísticas y Reportes AVZ
                       </li>
                       <li className="flex items-center gap-3 text-white">
                          <CheckCircle2 className="w-5 h-5 text-yellow-accent shrink-0" /> Plantillas WApp custom
                       </li>
                    </ul>
                  </div>
                  <Link href="/register">
                     <Button size="lg" className="w-full h-14 bg-yellow-accent hover:bg-yellow-400 text-navy font-bold text-lg rounded-xl transition-all">
                        Elegir Plan Pro
                     </Button>
                  </Link>
               </div>

            </div>
         </div>
      </section>

      {/* ----------------- FAQ ----------------- */}
      <section className="py-24 px-5 bg-white">
         <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-extrabold text-navy mb-4">Preguntas Frecuentes</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full text-navy">
               <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-green-primary hover:no-underline">¿Necesito saber programar o instalar algo?</AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed text-base">
                     No. TurnoGol está 100% en la nube. Te registrás con correo, configurás tus canchas y desde tu celular o compu ya empezás a operar y a recibir reservas.
                  </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-green-primary hover:no-underline">¿Cómo es lo de cobrar señas?</AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed text-base">
                     Podés conectar tu cuenta propia de MercadoPago en 1 click. Cuando un cliente reserva online, se le cobra directamente la seña definida (porcentaje o monto fijo) a TU cuenta. TurnoGol no retiene el dinero ni cobra comisiones extra por turno.
                  </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-green-primary hover:no-underline">¿Qué pasa al finalizar la prueba de 14 días?</AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed text-base">
                     Para seguir usando el sistema deberás suscribirte con tu tarjeta vía Débito Automático al plan que hayas elegido. Podés cancelar tu suscripción en cualquier momento y no hay contratos de permanencia.
                  </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-green-primary hover:no-underline">¿Tienen límite de clientes registrados?</AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed text-base">
                     ¡Cero límites! Todos los planes incluyen clientes ilimitados, reservas ilimitadas y ancho de banda ilimitado. Solo cobramos según el volumen estructural de tu complejo (cantidad de canchas y módulos).
                  </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-green-primary hover:no-underline">¿Funciona desde el celular de mi recepcionista?</AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed text-base">
                     Sí, la plataforma está diseñada mobile-first. Se ve increíble y reacciona de maravilla en las pantallas de todos los celulares. Podés dejarles un acceso directo en la pantalla de inicio y se sentirá como una App Nativa.
                  </AccordionContent>
               </AccordionItem>
            </Accordion>
         </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="bg-navy py-12 px-5 border-t border-blue-900 mt-auto">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-white font-extrabold text-2xl">
               TurnoGol <Goal className="w-6 h-6 text-yellow-accent" />
            </div>
            <div className="flex gap-6 text-sm text-blue-200">
               <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
               <a href="#" className="hover:text-white transition-colors">Políticas de Privacidad</a>
               <a href="#" className="hover:text-white transition-colors">Contacto Soporte</a>
            </div>
            <div className="text-blue-500/50 text-sm">
               © 2025 TurnoGol — Todos los derechos reservados.
            </div>
         </div>
      </footer>
    </div>
  );
}

// ---- Ui Sub-Blocks

function PainCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
   return (
      <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow">
         <div className="bg-red-50 w-12 h-12 flex items-center justify-center rounded-xl mb-4 mx-auto md:mx-0">
            <Icon className="w-6 h-6 text-red-500" />
         </div>
         <h3 className="font-bold text-navy text-lg mb-2">{title}</h3>
         <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
   );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
   return (
      <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-green-50/50 hover:border-green-200 transition-all group">
         <div className="bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm mb-4 group-hover:bg-green-primary transition-colors">
            <Icon className="w-6 h-6 text-navy group-hover:text-white" />
         </div>
         <h3 className="font-bold text-navy text-xl mb-2">{title}</h3>
         <p className="text-gray-600 leading-relaxed">{desc}</p>
      </div>
   );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
   return (
      <div className="flex flex-col items-center text-center max-w-[200px]">
         <div className="w-16 h-16 rounded-full bg-blue-900 border-2 border-blue-500 flex items-center justify-center text-2xl font-black text-white mb-4">
            {number}
         </div>
         <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
         <p className="text-blue-200 text-sm leading-relaxed">{desc}</p>
      </div>
   );
}
