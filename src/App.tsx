import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { AppShell } from "@/layouts/AppShell";

import { LoginPage } from "@/pages/auth/LoginPage";
import { PinLoginPage } from "@/pages/auth/PinLoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { RecoverAccessPage } from "@/pages/auth/RecoverAccessPage";

import { ExplorarTrabajosPage } from "@/pages/ExplorarTrabajosPage";
import { ExplorarTrabajadoresPage } from "@/pages/ExplorarTrabajadoresPage";
import { MapaPage } from "@/pages/MapaPage";
import { CrearTrabajoPage } from "@/pages/CrearTrabajoPage";
import { MisPublicacionesPage } from "@/pages/MisPublicacionesPage";
import { MisTrabajosPage } from "@/pages/MisTrabajosPage";
import { HistorialTrabajosPage } from "@/pages/HistorialTrabajosPage";
import { ChatsPage } from "@/pages/ChatsPage";
import { ConversacionPage } from "@/pages/ConversacionPage";
import { PerfilPage } from "@/pages/PerfilPage";
import { EditProfilePage } from "@/pages/EditProfilePage";
import { AccountMenuPage } from "@/pages/AccountMenuPage";
import { ConfigurarServiciosPage } from "@/pages/ConfigurarServiciosPage";
import { ConfigurarDisponibilidadPage } from "@/pages/ConfigurarDisponibilidadPage";
import { InhabilitarCuentaPage } from "@/pages/InhabilitarCuentaPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Autenticación (cada página maneja su propio PhoneFrame, sin bottom nav) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pin" element={<PinLoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/recuperar" element={<RecoverAccessPage />} />

          {/* App autenticada */}
          <Route element={<AppShell />}>
            <Route path="/explorar" element={<ExplorarTrabajosPage />} />
            <Route path="/trabajadores" element={<ExplorarTrabajadoresPage />} />
            <Route path="/mapa" element={<MapaPage />} />
            <Route path="/crear-trabajo" element={<CrearTrabajoPage />} />
            <Route path="/publicaciones" element={<MisPublicacionesPage />} />
            <Route path="/mis-trabajos" element={<MisTrabajosPage />} />
            <Route path="/historial" element={<HistorialTrabajosPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/chats/:id" element={<ConversacionPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/perfil/editar" element={<EditProfilePage />} />
            <Route path="/cuenta" element={<AccountMenuPage />} />
            <Route path="/cuenta/servicios" element={<ConfigurarServiciosPage />} />
            <Route path="/cuenta/disponibilidad" element={<ConfigurarDisponibilidadPage />} />
            <Route path="/cuenta/inhabilitar" element={<InhabilitarCuentaPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/explorar" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
