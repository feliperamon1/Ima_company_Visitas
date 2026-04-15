import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";

// ─── Context ───
const AppContext = createContext();
const useApp = () => useContext(AppContext);

// ─── Seed Data ───
const SEED_CLIENTS = [
  { id: "c1", name: "Ecopetrol S.A.", address: "Cra 13 #36-24, Bogotá", contact: "Carlos Méndez", phone: "+57 601 234 5678" },
  { id: "c2", name: "Grupo Argos", address: "Cra 43A #1A Sur-143, Medellín", contact: "Laura Gómez", phone: "+57 604 319 0000" },
  { id: "c3", name: "Bancolombia", address: "Cra 48 #26-85, Medellín", contact: "Andrés Restrepo", phone: "+57 604 404 1537" },
  { id: "c4", name: "ISA Intercolombia", address: "Calle 12 Sur #18-168, Medellín", contact: "María Fernanda López", phone: "+57 604 325 2270" },
  { id: "c5", name: "Cementos Argos", address: "Calle 7D #43A-99, Medellín", contact: "Pedro Salazar", phone: "+57 604 319 8888" },
];

const SEED_WORKERS = [
  { id: "w1", name: "Juan Camilo Rodríguez", role: "Técnico de Campo", email: "jcrodriguez@fieldops.co", phone: "+57 315 234 5678", joinDate: "2023-03-15", photo: null, assignedClients: ["c1", "c2", "c3"], password: "worker" },
  { id: "w2", name: "María Alejandra Torres", role: "Ingeniera de Soporte", email: "matorres@fieldops.co", phone: "+57 320 876 5432", joinDate: "2022-11-01", photo: null, assignedClients: ["c3", "c4", "c5"], password: "worker" },
  { id: "w3", name: "Carlos Andrés Mejía", role: "Consultor Senior", email: "camejia@fieldops.co", phone: "+57 318 654 3210", joinDate: "2024-01-20", photo: null, assignedClients: ["c1", "c4"], password: "worker" },
];

const ADMIN_USER = { id: "admin", name: "Administrador General", role: "admin", email: "admin@fieldops.co", password: "admin" };

const SEED_VISITS = [
  { id: "v1", workerId: "w1", clientId: "c1", date: "2026-04-14", plannedStart: "08:00", plannedEnd: "12:00", actualStart: "08:05", actualEnd: "12:10", startLat: 7.119, startLng: -73.122, endLat: 7.119, endLng: -73.123, status: "completed",
    activities: [
      { id: "a1", description: "Revisión de equipos de red", planned: true, status: "completed", evidenceUrl: "https://drive.google.com/evidence1", notes: "", newActivityId: null },
      { id: "a2", description: "Actualización de firmware switches", planned: true, status: "completed", evidenceUrl: "https://drive.google.com/evidence2", notes: "", newActivityId: null },
      { id: "a3", description: "Reparación cable UTP piso 3", planned: false, status: "completed", evidenceUrl: "https://drive.google.com/evidence3", notes: "Detectado durante revisión", newActivityId: null },
    ]},
  { id: "v2", workerId: "w1", clientId: "c2", date: "2026-04-15", plannedStart: "14:00", plannedEnd: "17:00", actualStart: null, actualEnd: null, startLat: null, startLng: null, endLat: null, endLng: null, status: "planned",
    activities: [
      { id: "a4", description: "Mantenimiento preventivo servidores", planned: true, status: "pending", evidenceUrl: "", notes: "", newActivityId: null },
      { id: "a5", description: "Backup base de datos producción", planned: true, status: "pending", evidenceUrl: "", notes: "", newActivityId: null },
    ]},
  { id: "v3", workerId: "w2", clientId: "c4", date: "2026-04-14", plannedStart: "09:00", plannedEnd: "13:00", actualStart: "09:15", actualEnd: "13:30", startLat: 6.217, startLng: -75.567, endLat: 6.217, endLng: -75.568, status: "completed",
    activities: [
      { id: "a6", description: "Capacitación sistema ERP", planned: true, status: "completed", evidenceUrl: "https://drive.google.com/evidence4", notes: "", newActivityId: null },
      { id: "a7", description: "Configuración módulo nómina", planned: true, status: "in_progress", evidenceUrl: "https://drive.google.com/avance1", notes: "Avance del 70%, pendiente integración", newActivityId: null },
      { id: "a8", description: "Soporte ticket #4521", planned: false, status: "not_completed", evidenceUrl: "", notes: "Se requiere acceso VPN que no fue otorgado", rescheduleDate: "2026-04-16", newActivityId: null },
    ]},
  { id: "v4", workerId: "w2", clientId: "c5", date: "2026-04-15", plannedStart: "08:00", plannedEnd: "11:00", actualStart: null, actualEnd: null, startLat: null, startLng: null, endLat: null, endLng: null, status: "planned",
    activities: [
      { id: "a9", description: "Instalación módulo inventarios", planned: true, status: "pending", evidenceUrl: "", notes: "", newActivityId: null },
    ]},
  { id: "v5", workerId: "w3", clientId: "c1", date: "2026-04-14", plannedStart: "10:00", plannedEnd: "15:00", actualStart: "10:00", actualEnd: null, startLat: 7.119, startLng: -73.122, endLat: null, endLng: null, status: "in_progress",
    activities: [
      { id: "a10", description: "Auditoría de procesos", planned: true, status: "in_progress", evidenceUrl: "https://drive.google.com/avance2", notes: "Revisando área de producción", newActivityId: null },
      { id: "a11", description: "Revisión documentación ISO", planned: true, status: "pending", evidenceUrl: "", notes: "", newActivityId: null },
    ]},
];

// ─── Helpers ───
const genId = () => Math.random().toString(36).substr(2, 9);
const fmtDate = (d) => { const dt = new Date(d + "T12:00:00"); return dt.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }); };
const fmtTime = (t) => t || "—";
const diffMins = (a, b) => { if (!a || !b) return null; const [ah, am] = a.split(":").map(Number); const [bh, bm] = b.split(":").map(Number); return (bh * 60 + bm) - (ah * 60 + am); };
const today = () => new Date().toISOString().split("T")[0];
const nowTime = () => { const n = new Date(); return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`; };

const statusColors = { planned: "#6366f1", in_progress: "#f59e0b", completed: "#10b981", not_completed: "#ef4444", pending: "#94a3b8" };
const statusLabels = { planned: "Planificada", in_progress: "En Progreso", completed: "Completada", not_completed: "No Cumplida", pending: "Pendiente" };
const actStatusLabels = { pending: "Pendiente", in_progress: "En Ejecución", completed: "Ejecutada", not_completed: "No Cumplida" };

// ─── Icons (inline SVG) ───
const Icon = ({ d, size = 20, color = "currentColor", ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{typeof d === "string" ? <path d={d} /> : d}</svg>
);
const Icons = {
  dashboard: <Icon d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>} />,
  calendar: <Icon d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>} />,
  clock: <Icon d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />,
  check: <Icon d="M20 6L9 17l-5-5" />,
  alert: <Icon d={<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>} />,
  user: <Icon d={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />,
  users: <Icon d={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>} />,
  settings: <Icon d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>} />,
  mapPin: <Icon d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>} />,
  plus: <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />,
  x: <Icon d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />,
  link: <Icon d={<><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>} />,
  logout: <Icon d={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} />,
  chevRight: <Icon d="M9 18l6-6-6-6" size={16} />,
  bar: <Icon d={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>} />,
  bell: <Icon d={<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>} />,
  edit: <Icon d={<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />,
  trash: <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>} />,
  star: <Icon d={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>} />,
};

// ─── Styles ───
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');

:root {
  --bg: #0c0f1a;
  --bg-card: #141829;
  --bg-card-hover: #1a1f38;
  --bg-input: #1a1f38;
  --border: #252a42;
  --border-focus: #6366f1;
  --text: #e2e4ed;
  --text-dim: #8b8fa8;
  --text-bright: #ffffff;
  --accent: #6366f1;
  --accent-light: #818cf8;
  --accent-glow: rgba(99,102,241,0.15);
  --success: #10b981;
  --success-bg: rgba(16,185,129,0.1);
  --warning: #f59e0b;
  --warning-bg: rgba(245,158,11,0.1);
  --danger: #ef4444;
  --danger-bg: rgba(239,68,68,0.1);
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 4px 24px rgba(0,0,0,0.3);
  --font: 'DM Sans', sans-serif;
  --mono: 'Space Mono', monospace;
  --sidebar-w: 260px;
  --topbar-h: 0px;
}

* { margin:0; padding:0; box-sizing:border-box; }
html, body, #root { height:100%; width:100%; overflow:hidden; }
body { font-family: var(--font); background: var(--bg); color: var(--text); }

input, select, textarea {
  font-family: var(--font);
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
input:focus, select:focus, textarea:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-glow); }
textarea { resize: vertical; min-height: 60px; }
select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b8fa8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }

button {
  font-family: var(--font);
  cursor: pointer;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-light); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
.btn-secondary { background: var(--bg-input); color: var(--text); border: 1px solid var(--border); }
.btn-secondary:hover { border-color: var(--accent); color: var(--text-bright); }
.btn-danger { background: var(--danger-bg); color: var(--danger); }
.btn-danger:hover { background: var(--danger); color: #fff; }
.btn-success { background: var(--success-bg); color: var(--success); }
.btn-success:hover { background: var(--success); color: #fff; }
.btn-sm { padding: 6px 12px; font-size: 13px; }
.btn-icon { padding: 8px; background: transparent; color: var(--text-dim); }
.btn-icon:hover { color: var(--text-bright); background: var(--bg-input); }

.sidebar {
  position: fixed;
  left: 0; top: 0;
  width: var(--sidebar-w);
  height: 100vh;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: transform 0.3s;
}
.sidebar-hidden { transform: translateX(-100%); }

.sidebar-logo {
  padding: 24px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}
.sidebar-logo h1 {
  font-family: var(--mono);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-bright);
  letter-spacing: -0.5px;
}
.sidebar-logo .logo-dot {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 14px;
  color: #fff;
}

.sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-dim);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  margin-bottom: 2px;
}
.sidebar-nav a:hover { background: var(--bg-card-hover); color: var(--text); }
.sidebar-nav a.active { background: var(--accent-glow); color: var(--accent-light); }
.sidebar-nav a.active svg { stroke: var(--accent-light); }

.sidebar-section { font-size: 11px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1.5px; padding: 20px 14px 8px; }

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}
.sidebar-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
}

.main {
  margin-left: var(--sidebar-w);
  height: 100vh;
  overflow-y: auto;
  padding: 32px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}
.page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-bright);
  letter-spacing: -0.5px;
}
.page-header .subtitle { font-size: 14px; color: var(--text-dim); margin-top: 4px; }

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card:hover { border-color: #353a5e; }
.card-clickable:hover { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); cursor: pointer; }

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stat-card .stat-value { font-family: var(--mono); font-size: 28px; font-weight: 700; color: var(--text-bright); }
.stat-card .stat-label { font-size: 13px; color: var(--text-dim); font-weight: 500; }
.stat-card .stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 16px; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; }
tr:hover td { background: var(--bg-card-hover); }
tr:last-child td { border-bottom: none; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  animation: fadeIn 0.2s;
}
.modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  max-width: 640px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.modal-header h3 { font-size: 18px; font-weight: 700; color: var(--text-bright); }
.modal-body { padding: 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }

.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text-dim); margin-bottom: 6px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.alert-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  margin-bottom: 16px;
  animation: slideDown 0.3s;
}
.alert-warning { background: var(--warning-bg); border: 1px solid rgba(245,158,11,0.2); color: var(--warning); }
.alert-danger { background: var(--danger-bg); border: 1px solid rgba(239,68,68,0.2); color: var(--danger); }
.alert-success { background: var(--success-bg); border: 1px solid rgba(16,185,129,0.2); color: var(--success); }

.progress-bar { height: 8px; background: var(--bg-input); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

.tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--bg-input); border-radius: var(--radius-sm); padding: 4px; }
.tab {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: transparent;
}
.tab:hover { color: var(--text); }
.tab.active { background: var(--accent); color: #fff; }

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}
.login-page::before {
  content: '';
  position: absolute;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%);
  top: -200px; right: -100px;
}
.login-page::after {
  content: '';
  position: absolute;
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%);
  bottom: -100px; left: -50px;
}
.login-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 48px;
  width: 420px;
  position: relative;
  z-index: 1;
  box-shadow: var(--shadow);
}

.activity-item {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s;
}
.activity-item:hover { border-color: #353a5e; }

.chart-bar-group { display: flex; align-items: flex-end; gap: 8px; }
.chart-bar {
  border-radius: 4px 4px 0 0;
  min-width: 32px;
  transition: height 0.5s ease;
  position: relative;
}
.chart-bar:hover { opacity: 0.85; }
.chart-label { font-size: 11px; color: var(--text-dim); text-align: center; margin-top: 8px; }

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-dim);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
  position: absolute;
  top: -2px;
  right: -2px;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.mobile-open { transform: translateX(0); }
  .main { margin-left: 0; padding: 20px; }
  .form-row { grid-template-columns: 1fr; }
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
`;

// ─── Components ───

function Badge({ status, type = "visit" }) {
  const labels = type === "visit" ? statusLabels : actStatusLabels;
  const c = statusColors[status] || "#94a3b8";
  return <span className="badge" style={{ background: `${c}18`, color: c }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: c, display: "inline-block" }} />{labels[status]}</span>;
}

function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-icon" onClick={onClose}>{Icons.x}</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ value, color = "var(--accent)" }) {
  return <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} /></div>;
}

function Tabs({ tabs, active, onChange }) {
  return <div className="tabs">{tabs.map(t => <button key={t.key} className={`tab ${active === t.key ? "active" : ""}`} onClick={() => onChange(t.key)}>{t.label}</button>)}</div>;
}

// ─── LOGIN ───
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = () => {
    if (email === ADMIN_USER.email && pass === ADMIN_USER.password) { onLogin(ADMIN_USER); return; }
    const w = SEED_WORKERS.find(w => w.email === email && w.password === pass);
    if (w) { onLogin(w); return; }
    setErr("Credenciales incorrectas. Verifique e intente nuevamente.");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div className="logo-dot" style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18, color: "#fff" }}>FO</div>
            <h1 style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--text-bright)", letterSpacing: -0.5 }}>FieldOps</h1>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Gestión de visitas y operaciones en campo</p>
        </div>
        {err && <div className="alert-bar alert-danger" style={{ marginBottom: 20 }}>{Icons.alert}<span>{err}</span></div>}
        <div className="form-group">
          <label>Correo electrónico</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@fieldops.co" onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <button className="btn-primary" style={{ width: "100%", marginTop: 8, padding: "12px 20px", fontSize: 15 }} onClick={handleLogin}>Iniciar Sesión</button>
        <div style={{ marginTop: 24, fontSize: 12, color: "var(--text-dim)", textAlign: "center", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text)" }}>Demo — Credenciales:</strong><br/>
          Admin: admin@fieldops.co / admin<br/>
          Trabajador: jcrodriguez@fieldops.co / worker<br/>
          Trabajador: matorres@fieldops.co / worker
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ───
function Sidebar({ user, page, setPage, onLogout, alerts, mobileOpen, setMobileOpen }) {
  const isAdmin = user.role === "admin";
  const initials = user.name.split(" ").map(w => w[0]).join("").slice(0, 2);

  const navItems = isAdmin
    ? [
        { key: "dashboard", label: "Dashboard", icon: Icons.dashboard },
        { key: "visits", label: "Visitas", icon: Icons.calendar },
        { key: "alerts", label: "Alertas", icon: Icons.bell, badge: alerts.length },
        { key: "workers", label: "Trabajadores", icon: Icons.users },
        { key: "clients", label: "Clientes", icon: Icons.settings },
      ]
    : [
        { key: "dashboard", label: "Mi Resumen", icon: Icons.dashboard },
        { key: "visits", label: "Mis Visitas", icon: Icons.calendar },
        { key: "alerts", label: "Alertas", icon: Icons.bell, badge: alerts.length },
        { key: "profile", label: "Mi Perfil", icon: Icons.user },
      ];

  return (
    <div className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-dot">FO</div>
        <h1>FieldOps</h1>
      </div>
      <div className="sidebar-nav">
        <div className="sidebar-section">{isAdmin ? "Administración" : "Operaciones"}</div>
        {navItems.map(item => (
          <a key={item.key} className={page === item.key ? "active" : ""} onClick={() => { setPage(item.key); setMobileOpen(false); }}>
            {item.icon}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge > 0 && <span className="badge" style={{ background: "var(--danger)", color: "#fff", padding: "2px 8px", fontSize: 11 }}>{item.badge}</span>}
          </a>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-bright)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{isAdmin ? "Administrador" : user.role}</div>
        </div>
        <button className="btn-icon" onClick={onLogout} title="Cerrar sesión">{Icons.logout}</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD (ADMIN) ───
function AdminDashboard({ visits, workers, clients }) {
  const totalVisits = visits.length;
  const completedVisits = visits.filter(v => v.status === "completed").length;
  const inProgress = visits.filter(v => v.status === "in_progress").length;
  const todayVisits = visits.filter(v => v.date === today()).length;

  const allActivities = visits.flatMap(v => v.activities);
  const completedActs = allActivities.filter(a => a.status === "completed").length;
  const totalActs = allActivities.length;
  const actCompletion = totalActs ? Math.round((completedActs / totalActs) * 100) : 0;

  const onTimeArrivals = visits.filter(v => {
    if (!v.actualStart || !v.plannedStart) return false;
    return diffMins(v.plannedStart, v.actualStart) <= 10;
  }).length;
  const arrivedVisits = visits.filter(v => v.actualStart).length;
  const punctuality = arrivedVisits ? Math.round((onTimeArrivals / arrivedVisits) * 100) : 0;

  const workerPerf = workers.map(w => {
    const wVisits = visits.filter(v => v.workerId === w.id);
    const wCompleted = wVisits.filter(v => v.status === "completed").length;
    const wActs = wVisits.flatMap(v => v.activities);
    const wActsDone = wActs.filter(a => a.status === "completed").length;
    const wOnTime = wVisits.filter(v => v.actualStart && v.plannedStart && diffMins(v.plannedStart, v.actualStart) <= 10).length;
    const wArrived = wVisits.filter(v => v.actualStart).length;
    return {
      ...w,
      totalVisits: wVisits.length,
      completedVisits: wCompleted,
      totalActs: wActs.length,
      completedActs: wActsDone,
      punctuality: wArrived ? Math.round((wOnTime / wArrived) * 100) : 0,
      performance: wActs.length ? Math.round((wActsDone / wActs.length) * 100) : 0,
    };
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard General</h2>
          <div className="subtitle">{fmtDate(today())} — Vista consolidada del equipo</div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "var(--accent-glow)" }}>{Icons.calendar}</div>
          <div className="stat-value">{todayVisits}</div>
          <div className="stat-label">Visitas Hoy</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "var(--success-bg)" }}>{Icons.check}</div>
          <div className="stat-value">{completedVisits}<span style={{ fontSize: 14, color: "var(--text-dim)" }}>/{totalVisits}</span></div>
          <div className="stat-label">Visitas Completadas</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "var(--warning-bg)" }}>{Icons.clock}</div>
          <div className="stat-value">{punctuality}%</div>
          <div className="stat-label">Puntualidad</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "rgba(168,85,247,0.1)" }}>{Icons.check}</div>
          <div className="stat-value">{actCompletion}%</div>
          <div className="stat-label">Actividades Cumplidas</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-bright)", marginBottom: 20 }}>Desempeño por Trabajador</h3>
          {workerPerf.map(w => (
            <div key={w.id} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-bright)" }}>{w.name}</span>
                  <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: 8 }}>{w.role}</span>
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: w.performance >= 80 ? "var(--success)" : w.performance >= 50 ? "var(--warning)" : "var(--danger)" }}>{w.performance}%</span>
              </div>
              <ProgressBar value={w.performance} color={w.performance >= 80 ? "var(--success)" : w.performance >= 50 ? "var(--warning)" : "var(--danger)"} />
              <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 12, color: "var(--text-dim)" }}>
                <span>{w.completedVisits}/{w.totalVisits} visitas</span>
                <span>{w.completedActs}/{w.totalActs} actividades</span>
                <span>Puntualidad: {w.punctuality}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-bright)", marginBottom: 20 }}>Visitas Recientes</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Trabajador</th><th>Cliente</th><th>Fecha</th><th>Estado</th></tr></thead>
              <tbody>
                {visits.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(v => {
                  const w = workers.find(x => x.id === v.workerId);
                  const c = clients.find(x => x.id === v.clientId);
                  return (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 500 }}>{w?.name || "—"}</td>
                      <td>{c?.name || "—"}</td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{fmtDate(v.date)}</td>
                      <td><Badge status={v.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-bright)", marginBottom: 20 }}>Distribución de Actividades por Estado</h3>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {["completed", "in_progress", "pending", "not_completed"].map(st => {
            const count = allActivities.filter(a => a.status === st).length;
            const pct = totalActs ? Math.round((count / totalActs) * 100) : 0;
            return (
              <div key={st} style={{ flex: "1 1 120px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 32, fontWeight: 700, color: statusColors[st] }}>{count}</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>{actStatusLabels[st]}</div>
                <ProgressBar value={pct} color={statusColors[st]} />
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD (WORKER) ───
function WorkerDashboard({ visits, worker, clients }) {
  const myVisits = visits.filter(v => v.workerId === worker.id);
  const todayV = myVisits.filter(v => v.date === today());
  const completed = myVisits.filter(v => v.status === "completed").length;
  const myActs = myVisits.flatMap(v => v.activities);
  const actsDone = myActs.filter(a => a.status === "completed").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Mi Resumen</h2>
          <div className="subtitle">{fmtDate(today())} — Buen día, {worker.name.split(" ")[0]}</div>
        </div>
      </div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "var(--accent-glow)" }}>{Icons.calendar}</div>
          <div className="stat-value">{todayV.length}</div>
          <div className="stat-label">Visitas Hoy</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "var(--success-bg)" }}>{Icons.check}</div>
          <div className="stat-value">{completed}<span style={{ fontSize: 14, color: "var(--text-dim)" }}>/{myVisits.length}</span></div>
          <div className="stat-label">Completadas</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "rgba(168,85,247,0.1)" }}>{Icons.star}</div>
          <div className="stat-value">{myActs.length ? Math.round((actsDone / myActs.length) * 100) : 0}%</div>
          <div className="stat-label">Cumplimiento Act.</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "var(--warning-bg)" }}>{Icons.clock}</div>
          <div className="stat-value">{myActs.filter(a => a.status === "in_progress").length}</div>
          <div className="stat-label">En Ejecución</div>
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-bright)", marginBottom: 16 }}>Visitas de Hoy</h3>
      {todayV.length === 0 && <div className="card empty-state"><p>No tienes visitas programadas para hoy</p></div>}
      <div className="grid-3">
        {todayV.map(v => {
          const cl = clients.find(c => c.id === v.clientId);
          return (
            <div key={v.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-bright)", fontSize: 15 }}>{cl?.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>{cl?.address}</div>
                </div>
                <Badge status={v.status} />
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-dim)", marginBottom: 12 }}>
                <span>Plan: {fmtTime(v.plannedStart)} - {fmtTime(v.plannedEnd)}</span>
              </div>
              {v.actualStart && <div style={{ fontSize: 13, color: "var(--success)" }}>Ingreso: {v.actualStart}</div>}
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8 }}>{v.activities.length} actividades planificadas</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── VISIT FORM MODAL ───
function VisitFormModal({ open, onClose, onSave, visit, clients, workers, isAdmin, currentUser }) {
  const [form, setForm] = useState({ clientId: "", date: today(), plannedStart: "08:00", plannedEnd: "12:00", workerId: currentUser.id, activities: [{ id: genId(), description: "", planned: true, status: "pending", evidenceUrl: "", notes: "", newActivityId: null }] });

  useEffect(() => {
    if (visit) {
      setForm({ ...visit });
    } else {
      setForm({ clientId: "", date: today(), plannedStart: "08:00", plannedEnd: "12:00", workerId: currentUser.id, activities: [{ id: genId(), description: "", planned: true, status: "pending", evidenceUrl: "", notes: "", newActivityId: null }] });
    }
  }, [visit, open]);

  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addActivity = () => setForm(f => ({ ...f, activities: [...f.activities, { id: genId(), description: "", planned: true, status: "pending", evidenceUrl: "", notes: "", newActivityId: null }] }));
  const removeActivity = (i) => setForm(f => ({ ...f, activities: f.activities.filter((_, idx) => idx !== i) }));
  const updateActivity = (i, k, v) => setForm(f => ({ ...f, activities: f.activities.map((a, idx) => idx === i ? { ...a, [k]: v } : a) }));

  const availableClients = isAdmin ? clients : clients.filter(c => currentUser.assignedClients?.includes(c.id));

  const handleSave = () => {
    if (!form.clientId || !form.date || !form.plannedStart || !form.plannedEnd) return;
    if (form.activities.some(a => !a.description.trim())) return;
    onSave({
      ...form,
      id: visit?.id || genId(),
      status: visit?.status || "planned",
      actualStart: visit?.actualStart || null,
      actualEnd: visit?.actualEnd || null,
      startLat: visit?.startLat || null,
      startLng: visit?.startLng || null,
      endLat: visit?.endLat || null,
      endLng: visit?.endLng || null,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={visit ? "Editar Visita" : "Nueva Visita"} footer={<><button className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary" onClick={handleSave}>Guardar</button></>}>
      {isAdmin && (
        <div className="form-group">
          <label>Trabajador</label>
          <select value={form.workerId} onChange={e => updateField("workerId", e.target.value)}>
            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      )}
      <div className="form-group">
        <label>Cliente</label>
        <select value={form.clientId} onChange={e => updateField("clientId", e.target.value)}>
          <option value="">Seleccionar cliente...</option>
          {availableClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Fecha</label>
        <input type="date" value={form.date} onChange={e => updateField("date", e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Hora Inicio Planificada</label>
          <input type="time" value={form.plannedStart} onChange={e => updateField("plannedStart", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Hora Fin Planificada</label>
          <input type="time" value={form.plannedEnd} onChange={e => updateField("plannedEnd", e.target.value)} />
        </div>
      </div>
      <div style={{ marginTop: 8, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dim)" }}>Actividades a Ejecutar</label>
        <button className="btn-secondary btn-sm" onClick={addActivity}>{Icons.plus} Agregar</button>
      </div>
      {form.activities.map((a, i) => (
        <div key={a.id} className="activity-item">
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <input style={{ flex: 1 }} placeholder="Descripción de la actividad..." value={a.description} onChange={e => updateActivity(i, "description", e.target.value)} />
            {form.activities.length > 1 && <button className="btn-icon" onClick={() => removeActivity(i)}>{Icons.trash}</button>}
          </div>
        </div>
      ))}
    </Modal>
  );
}

// ─── VISIT DETAIL MODAL ───
function VisitDetailModal({ open, onClose, visit, clients, workers, onUpdate }) {
  const [v, setV] = useState(null);

  useEffect(() => { if (visit) setV({ ...visit, activities: visit.activities.map(a => ({ ...a })) }); }, [visit, open]);
  if (!v) return null;

  const cl = clients.find(c => c.id === v.clientId);
  const wk = workers.find(w => w.id === v.workerId);

  const doCheckIn = () => {
    const time = nowTime();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setV(prev => ({ ...prev, actualStart: time, startLat: pos.coords.latitude, startLng: pos.coords.longitude, status: "in_progress" })); },
        () => { setV(prev => ({ ...prev, actualStart: time, startLat: null, startLng: null, status: "in_progress" })); }
      );
    } else {
      setV(prev => ({ ...prev, actualStart: time, status: "in_progress" }));
    }
  };

  const doCheckOut = () => {
    const time = nowTime();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setV(prev => ({ ...prev, actualEnd: time, endLat: pos.coords.latitude, endLng: pos.coords.longitude, status: "completed" })); },
        () => { setV(prev => ({ ...prev, actualEnd: time, endLat: null, endLng: null, status: "completed" })); }
      );
    } else {
      setV(prev => ({ ...prev, actualEnd: time, status: "completed" }));
    }
  };

  const updateAct = (i, k, val) => {
    setV(prev => {
      const acts = [...prev.activities];
      acts[i] = { ...acts[i], [k]: val };
      return { ...prev, activities: acts };
    });
  };

  const addUnplanned = () => {
    setV(prev => ({ ...prev, activities: [...prev.activities, { id: genId(), description: "", planned: false, status: "pending", evidenceUrl: "", notes: "", newActivityId: null }] }));
  };

  const addGeneratedActivity = (parentIdx) => {
    const newId = genId();
    setV(prev => {
      const acts = [...prev.activities];
      acts[parentIdx] = { ...acts[parentIdx], newActivityId: newId };
      return { ...prev, activities: [...acts, { id: newId, description: "", planned: false, status: "pending", evidenceUrl: "", notes: "", parentDescription: acts[parentIdx].description, newActivityId: null }] };
    });
  };

  const handleSave = () => { onUpdate(v); onClose(); };

  return (
    <Modal open={open} onClose={onClose} title="Detalle de Visita" footer={<><button className="btn-secondary" onClick={onClose}>Cerrar</button><button className="btn-primary" onClick={handleSave}>Guardar Cambios</button></>}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text-bright)" }}>{cl?.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>{cl?.address}</div>
          {wk && <div style={{ fontSize: 13, color: "var(--accent-light)", marginTop: 4 }}>Asignado a: {wk.name}</div>}
        </div>
        <Badge status={v.status} />
      </div>

      <div style={{ background: "var(--bg-input)", borderRadius: "var(--radius-sm)", padding: 16, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
          <div><span style={{ color: "var(--text-dim)" }}>Fecha:</span> <span style={{ color: "var(--text-bright)", fontFamily: "var(--mono)" }}>{fmtDate(v.date)}</span></div>
          <div><span style={{ color: "var(--text-dim)" }}>Plan:</span> <span style={{ color: "var(--text-bright)", fontFamily: "var(--mono)" }}>{v.plannedStart} - {v.plannedEnd}</span></div>
          <div>
            <span style={{ color: "var(--text-dim)" }}>Ingreso Real:</span>{" "}
            <span style={{ color: v.actualStart ? "var(--success)" : "var(--text-dim)", fontFamily: "var(--mono)" }}>{v.actualStart || "Sin registro"}</span>
            {v.startLat && <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 4 }}>({v.startLat.toFixed(3)}, {v.startLng.toFixed(3)})</span>}
          </div>
          <div>
            <span style={{ color: "var(--text-dim)" }}>Salida Real:</span>{" "}
            <span style={{ color: v.actualEnd ? "var(--success)" : "var(--text-dim)", fontFamily: "var(--mono)" }}>{v.actualEnd || "Sin registro"}</span>
            {v.endLat && <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 4 }}>({v.endLat.toFixed(3)}, {v.endLng.toFixed(3)})</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {!v.actualStart && v.status === "planned" && <button className="btn-success btn-sm" onClick={doCheckIn}>{Icons.mapPin} Registrar Ingreso</button>}
          {v.actualStart && !v.actualEnd && <button className="btn-danger btn-sm" onClick={doCheckOut}>{Icons.mapPin} Registrar Salida</button>}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-bright)" }}>Actividades ({v.activities.length})</label>
        <button className="btn-secondary btn-sm" onClick={addUnplanned}>{Icons.plus} No Planificada</button>
      </div>

      {v.activities.map((a, i) => (
        <div key={a.id} className="activity-item">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              {a.parentDescription && <div style={{ fontSize: 11, color: "var(--accent-light)", marginBottom: 4 }}>Generada desde: {a.parentDescription}</div>}
              {!a.planned && !a.parentDescription && <span className="badge" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", marginBottom: 4, fontSize: 11 }}>No Planificada</span>}
              <input value={a.description} onChange={e => updateAct(i, "description", e.target.value)} placeholder="Descripción de la actividad" style={{ fontWeight: 600, fontSize: 14 }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 8 }}>
            <label>Estado</label>
            <select value={a.status} onChange={e => updateAct(i, "status", e.target.value)}>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Ejecución</option>
              <option value="completed">Ejecutada</option>
              <option value="not_completed">No Cumplida</option>
            </select>
          </div>

          {(a.status === "completed" || a.status === "in_progress") && (
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label>Enlace de Evidencia {a.status === "completed" ? "(Obligatorio)" : "(Avances)"} *</label>
              <input type="url" value={a.evidenceUrl} onChange={e => updateAct(i, "evidenceUrl", e.target.value)} placeholder="https://drive.google.com/..." style={{ borderColor: (a.status === "completed" || a.status === "in_progress") && !a.evidenceUrl ? "var(--danger)" : undefined }} />
              {(a.status === "completed" || a.status === "in_progress") && !a.evidenceUrl && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>El enlace de evidencia es obligatorio</div>}
            </div>
          )}

          {a.status === "in_progress" && (
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label>Notas de Avance</label>
              <textarea value={a.notes} onChange={e => updateAct(i, "notes", e.target.value)} placeholder="Describe el avance realizado..." />
            </div>
          )}

          {a.status === "not_completed" && (
            <>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label>Motivo de Incumplimiento *</label>
                <textarea value={a.notes} onChange={e => updateAct(i, "notes", e.target.value)} placeholder="Indicar el motivo por el cual no se cumplió..." style={{ borderColor: !a.notes ? "var(--danger)" : undefined }} />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label>Reprogramar para</label>
                <input type="date" value={a.rescheduleDate || ""} onChange={e => updateAct(i, "rescheduleDate", e.target.value)} min={today()} />
              </div>
            </>
          )}

          {(a.status === "completed" || a.status === "in_progress") && !a.newActivityId && (
            <button className="btn-secondary btn-sm" style={{ marginTop: 4 }} onClick={() => addGeneratedActivity(i)}>{Icons.plus} Generar Nueva Actividad</button>
          )}
          {a.newActivityId && <div style={{ fontSize: 12, color: "var(--accent-light)", marginTop: 4 }}>→ Actividad generada agregada abajo</div>}
        </div>
      ))}
    </Modal>
  );
}

// ─── VISITS PAGE ───
function VisitsPage({ visits, setVisits, clients, workers, user }) {
  const isAdmin = user.role === "admin";
  const [showForm, setShowForm] = useState(false);
  const [editVisit, setEditVisit] = useState(null);
  const [detailVisit, setDetailVisit] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterWorker, setFilterWorker] = useState("");

  const myVisits = isAdmin ? visits : visits.filter(v => v.workerId === user.id);
  const filtered = myVisits.filter(v => {
    if (filterDate && v.date !== filterDate) return false;
    if (filterStatus && v.status !== filterStatus) return false;
    if (filterWorker && v.workerId !== filterWorker) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const handleSaveVisit = (v) => {
    setVisits(prev => {
      const exists = prev.find(x => x.id === v.id);
      if (exists) return prev.map(x => x.id === v.id ? v : x);
      return [...prev, v];
    });
  };

  const handleUpdateVisit = (v) => {
    setVisits(prev => prev.map(x => x.id === v.id ? v : x));
  };

  const handleDelete = (id) => {
    if (confirm("¿Está seguro de eliminar esta visita?")) {
      setVisits(prev => prev.filter(x => x.id !== id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{isAdmin ? "Todas las Visitas" : "Mis Visitas"}</h2>
          <div className="subtitle">{filtered.length} visitas encontradas</div>
        </div>
        <button className="btn-primary" onClick={() => { setEditVisit(null); setShowForm(true); }}>{Icons.plus} Nueva Visita</button>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 180 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 180 }}>
            <option value="">Todos los estados</option>
            <option value="planned">Planificada</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completada</option>
          </select>
          {isAdmin && (
            <select value={filterWorker} onChange={e => setFilterWorker(e.target.value)} style={{ width: 220 }}>
              <option value="">Todos los trabajadores</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          )}
          {(filterDate || filterStatus || filterWorker) && <button className="btn-secondary btn-sm" onClick={() => { setFilterDate(""); setFilterStatus(""); setFilterWorker(""); }}>Limpiar filtros</button>}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {isAdmin && <th>Trabajador</th>}
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Hora Plan</th>
                <th>Ingreso</th>
                <th>Salida</th>
                <th>Actividades</th>
                <th>Estado</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={isAdmin ? 9 : 8} style={{ textAlign: "center", color: "var(--text-dim)", padding: 40 }}>No hay visitas para mostrar</td></tr>}
              {filtered.map(v => {
                const cl = clients.find(c => c.id === v.clientId);
                const wk = workers.find(w => w.id === v.workerId);
                const actDone = v.activities.filter(a => a.status === "completed").length;
                return (
                  <tr key={v.id} style={{ cursor: "pointer" }} onClick={() => setDetailVisit(v)}>
                    {isAdmin && <td style={{ fontWeight: 500 }}>{wk?.name}</td>}
                    <td style={{ fontWeight: 600, color: "var(--text-bright)" }}>{cl?.name}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{fmtDate(v.date)}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{v.plannedStart}-{v.plannedEnd}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 13, color: v.actualStart ? "var(--success)" : "var(--text-dim)" }}>{fmtTime(v.actualStart)}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 13, color: v.actualEnd ? "var(--success)" : "var(--text-dim)" }}>{fmtTime(v.actualEnd)}</td>
                    <td><span style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{actDone}/{v.activities.length}</span></td>
                    <td><Badge status={v.status} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn-icon" onClick={() => { setEditVisit(v); setShowForm(true); }} title="Editar">{Icons.edit}</button>
                        <button className="btn-icon" style={{ color: "var(--danger)" }} onClick={() => handleDelete(v.id)} title="Eliminar">{Icons.trash}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <VisitFormModal open={showForm} onClose={() => setShowForm(false)} onSave={handleSaveVisit} visit={editVisit} clients={clients} workers={workers} isAdmin={isAdmin} currentUser={user} />
      <VisitDetailModal open={!!detailVisit} onClose={() => setDetailVisit(null)} visit={detailVisit} clients={clients} workers={workers} onUpdate={handleUpdateVisit} />
    </div>
  );
}

// ─── ALERTS PAGE ───
function AlertsPage({ visits, workers, clients, user }) {
  const isAdmin = user.role === "admin";
  const relevantVisits = isAdmin ? visits : visits.filter(v => v.workerId === user.id);

  const alerts = [];

  relevantVisits.forEach(v => {
    const cl = clients.find(c => c.id === v.clientId);
    const wk = workers.find(w => w.id === v.workerId);
    const label = `${wk?.name || "—"} → ${cl?.name || "—"} (${fmtDate(v.date)})`;

    // No check-in for past/today visits
    if (v.date <= today() && !v.actualStart && v.status !== "completed") {
      alerts.push({ type: "danger", title: "Sin registro de ingreso", desc: label, visitId: v.id });
    }
    // No check-out for started visits
    if (v.actualStart && !v.actualEnd && v.date < today()) {
      alerts.push({ type: "warning", title: "Sin registro de salida", desc: label, visitId: v.id });
    }
    // Late arrival
    if (v.actualStart && v.plannedStart && diffMins(v.plannedStart, v.actualStart) > 10) {
      alerts.push({ type: "warning", title: `Llegada tardía (${diffMins(v.plannedStart, v.actualStart)} min)`, desc: label, visitId: v.id });
    }
    // No activities registered for completed visits
    if (v.status === "completed" && v.activities.every(a => a.status === "pending")) {
      alerts.push({ type: "danger", title: "Visita completada sin actividades registradas", desc: label, visitId: v.id });
    }
    // Evidence missing on completed/in_progress activities
    v.activities.forEach(a => {
      if ((a.status === "completed" || a.status === "in_progress") && !a.evidenceUrl) {
        alerts.push({ type: "danger", title: `Actividad sin evidencia: ${a.description}`, desc: label, visitId: v.id });
      }
    });
    // Not completed without reason
    v.activities.forEach(a => {
      if (a.status === "not_completed" && !a.notes) {
        alerts.push({ type: "warning", title: `Actividad no cumplida sin motivo: ${a.description}`, desc: label, visitId: v.id });
      }
    });
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Centro de Alertas</h2>
          <div className="subtitle">{alerts.length} alertas activas</div>
        </div>
      </div>
      {alerts.length === 0 && (
        <div className="card empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-bright)" }}>¡Todo en orden!</p>
          <p style={{ marginTop: 8 }}>No hay alertas pendientes</p>
        </div>
      )}
      {alerts.map((a, i) => (
        <div key={i} className={`alert-bar alert-${a.type}`} style={{ alignItems: "flex-start" }}>
          {a.type === "danger" ? Icons.alert : Icons.bell}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{a.title}</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{a.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PROFILE PAGE (WORKER) ───
function ProfilePage({ user, clients }) {
  const myClients = clients.filter(c => user.assignedClients?.includes(c.id));
  const initials = user.name.split(" ").map(w => w[0]).join("").slice(0, 2);

  return (
    <div>
      <div className="page-header"><div><h2>Mi Perfil</h2></div></div>
      <div className="grid-2">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 28, color: "#fff", marginBottom: 16 }}>{initials}</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-bright)" }}>{user.name}</h3>
          <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 4 }}>{user.role}</p>
          <div style={{ marginTop: 20, textAlign: "left" }}>
            {[
              ["Correo", user.email],
              ["Celular", user.phone],
              ["Fecha Ingreso", user.joinDate ? fmtDate(user.joinDate) : "—"],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                <span style={{ color: "var(--text-dim)" }}>{l}</span>
                <span style={{ color: "var(--text-bright)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-bright)", marginBottom: 16 }}>Clientes Asignados ({myClients.length})</h3>
          {myClients.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Icons.users}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-bright)" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{c.address}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── WORKERS ADMIN ───
function WorkersPage({ workers, setWorkers, clients }) {
  const [showForm, setShowForm] = useState(false);
  const [editWorker, setEditWorker] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", email: "", phone: "", joinDate: today(), assignedClients: [], password: "worker" });

  useEffect(() => {
    if (editWorker) setForm({ ...editWorker });
    else setForm({ name: "", role: "", email: "", phone: "", joinDate: today(), assignedClients: [], password: "worker" });
  }, [editWorker, showForm]);

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editWorker) {
      setWorkers(prev => prev.map(w => w.id === editWorker.id ? { ...form, id: editWorker.id } : w));
    } else {
      setWorkers(prev => [...prev, { ...form, id: genId(), photo: null }]);
    }
    setShowForm(false); setEditWorker(null);
  };

  const handleDelete = (id) => { if (confirm("¿Eliminar este trabajador?")) setWorkers(prev => prev.filter(w => w.id !== id)); };

  const toggleClient = (cid) => {
    setForm(f => ({
      ...f,
      assignedClients: f.assignedClients.includes(cid) ? f.assignedClients.filter(x => x !== cid) : [...f.assignedClients, cid]
    }));
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Gestión de Trabajadores</h2><div className="subtitle">{workers.length} trabajadores registrados</div></div>
        <button className="btn-primary" onClick={() => { setEditWorker(null); setShowForm(true); }}>{Icons.plus} Nuevo Trabajador</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Cargo</th><th>Email</th><th>Celular</th><th>Clientes</th><th></th></tr></thead>
            <tbody>
              {workers.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-bright)" }}>{w.name}</td>
                  <td>{w.role}</td>
                  <td style={{ fontSize: 13 }}>{w.email}</td>
                  <td style={{ fontSize: 13 }}>{w.phone}</td>
                  <td><span className="badge" style={{ background: "var(--accent-glow)", color: "var(--accent-light)" }}>{w.assignedClients?.length || 0} clientes</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn-icon" onClick={() => { setEditWorker(w); setShowForm(true); }}>{Icons.edit}</button>
                      <button className="btn-icon" style={{ color: "var(--danger)" }} onClick={() => handleDelete(w.id)}>{Icons.trash}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditWorker(null); }} title={editWorker ? "Editar Trabajador" : "Nuevo Trabajador"} footer={<><button className="btn-secondary" onClick={() => { setShowForm(false); setEditWorker(null); }}>Cancelar</button><button className="btn-primary" onClick={handleSave}>Guardar</button></>}>
        <div className="form-row">
          <div className="form-group"><label>Nombre Completo</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="form-group"><label>Cargo</label><input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Correo Electrónico</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="form-group"><label>Celular</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Fecha de Ingreso</label><input type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))} /></div>
          <div className="form-group"><label>Contraseña</label><input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
        </div>
        <div className="form-group">
          <label>Clientes Asignados</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {clients.map(c => (
              <button key={c.id} className={form.assignedClients?.includes(c.id) ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => toggleClient(c.id)}>
                {form.assignedClients?.includes(c.id) ? "✓ " : ""}{c.name}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── CLIENTS ADMIN ───
function ClientsPage({ clients, setClients }) {
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", contact: "", phone: "" });

  useEffect(() => {
    if (editClient) setForm({ ...editClient });
    else setForm({ name: "", address: "", contact: "", phone: "" });
  }, [editClient, showForm]);

  const handleSave = () => {
    if (!form.name) return;
    if (editClient) {
      setClients(prev => prev.map(c => c.id === editClient.id ? { ...form, id: editClient.id } : c));
    } else {
      setClients(prev => [...prev, { ...form, id: genId() }]);
    }
    setShowForm(false); setEditClient(null);
  };

  const handleDelete = (id) => { if (confirm("¿Eliminar este cliente?")) setClients(prev => prev.filter(c => c.id !== id)); };

  return (
    <div>
      <div className="page-header">
        <div><h2>Gestión de Clientes</h2><div className="subtitle">{clients.length} clientes registrados</div></div>
        <button className="btn-primary" onClick={() => { setEditClient(null); setShowForm(true); }}>{Icons.plus} Nuevo Cliente</button>
      </div>
      <div className="grid-3">
        {clients.map(c => (
          <div key={c.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h4 style={{ fontWeight: 700, color: "var(--text-bright)", fontSize: 15, marginBottom: 8 }}>{c.name}</h4>
                <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
                  <div>{c.address}</div>
                  <div>Contacto: {c.contact}</div>
                  <div>{c.phone}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn-icon" onClick={() => { setEditClient(c); setShowForm(true); }}>{Icons.edit}</button>
                <button className="btn-icon" style={{ color: "var(--danger)" }} onClick={() => handleDelete(c.id)}>{Icons.trash}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditClient(null); }} title={editClient ? "Editar Cliente" : "Nuevo Cliente"} footer={<><button className="btn-secondary" onClick={() => { setShowForm(false); setEditClient(null); }}>Cancelar</button><button className="btn-primary" onClick={handleSave}>Guardar</button></>}>
        <div className="form-group"><label>Nombre / Razón Social</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div className="form-group"><label>Dirección</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
        <div className="form-row">
          <div className="form-group"><label>Persona de Contacto</label><input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
          <div className="form-group"><label>Teléfono</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [workers, setWorkers] = useState(SEED_WORKERS);
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [visits, setVisits] = useState(SEED_VISITS);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Compute alerts
  const isAdmin = user?.role === "admin";
  const relevantVisits = isAdmin ? visits : visits.filter(v => v.workerId === user?.id);
  const alerts = useMemo(() => {
    const a = [];
    relevantVisits.forEach(v => {
      if (v.date <= today() && !v.actualStart && v.status !== "completed") a.push(1);
      if (v.actualStart && !v.actualEnd && v.date < today()) a.push(1);
      if (v.status === "completed" && v.activities.every(act => act.status === "pending")) a.push(1);
      v.activities.forEach(act => {
        if ((act.status === "completed" || act.status === "in_progress") && !act.evidenceUrl) a.push(1);
      });
    });
    return a;
  }, [relevantVisits]);

  if (!user) return <><style>{css}</style><LoginPage onLogin={setUser} /></>;

  const renderPage = () => {
    switch (page) {
      case "dashboard": return isAdmin ? <AdminDashboard visits={visits} workers={workers} clients={clients} /> : <WorkerDashboard visits={visits} worker={user} clients={clients} />;
      case "visits": return <VisitsPage visits={visits} setVisits={setVisits} clients={clients} workers={workers} user={user} />;
      case "alerts": return <AlertsPage visits={visits} workers={workers} clients={clients} user={user} />;
      case "profile": return <ProfilePage user={user} clients={clients} />;
      case "workers": return isAdmin ? <WorkersPage workers={workers} setWorkers={setWorkers} clients={clients} /> : null;
      case "clients": return isAdmin ? <ClientsPage clients={clients} setClients={setClients} /> : null;
      default: return null;
    }
  };

  return (
    <>
      <style>{css}</style>
      <Sidebar user={user} page={page} setPage={setPage} onLogout={() => { setUser(null); setPage("dashboard"); }} alerts={alerts} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: "none", position: "fixed", top: 16, left: 16, zIndex: 200, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)" }} className="mobile-menu-btn">☰</button>
      <div className="main">{renderPage()}</div>
      {mobileOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }} onClick={() => setMobileOpen(false)} />}
    </>
  );
}
