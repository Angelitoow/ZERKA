"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LuEye, LuEyeOff, LuKeyRound, LuShieldCheck, LuUser } from "react-icons/lu";
import { bebas } from "./ui/fonts";
import { useDemo } from "./context/DemoStore";
import { Campo } from "./components/ui";
import { BARRIOS, CIUDADES, CREDENCIALES_DEMO, GENEROS } from "./data/demo";
import { enfocarError, REGLAS, validarPersona, type Errores } from "./lib/utils";

const VACIO = { nombres: "", apellidos: "", telefono: "", nacimiento: "", genero: "", ciudad: "", barrio: "", correo: "", clave: "" };
type Datos = typeof VACIO;

const Login = () => {
  const router = useRouter();
  const { iniciarSesion, registrar, notificar } = useDemo();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState<Errores<Datos>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const registro = activeTab === "register";

  const campo = (k: keyof Datos) => ({
    name: k, value: datos[k], className: "input",
    onChange: (e: { target: { value: string } }) => setDatos((d) => ({ ...d, [k]: e.target.value })),
  });

  function cambiarTab(tab: typeof activeTab, correo = "") {
    setActiveTab(tab); setDatos({ ...VACIO, correo }); setErrores({}); setShowPassword(false); setMessage({ text: "", type: "" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    const errs: Errores<Datos> = registro ? validarPersona(datos, true) : {
      ...(!REGLAS.correo.test(datos.correo.trim()) && { correo: datos.correo ? "Formato de correo inválido." : "Ingresa tu correo electrónico." }),
      ...(!datos.clave && { clave: "Ingresa tu contraseña." }),
    };
    setErrores(errs);
    if (Object.keys(errs).length) {
      enfocarError();
      return setMessage({ text: "Revisa los campos marcados en rojo.", type: "error" });
    }

    setLoading(true);
    try {
      if (!registro) {
        const r = await iniciarSesion(datos.correo, datos.clave);
        if (typeof r === "string") {
          setMessage({ text: r, type: "error" });
          return;
        }
        notificar(`¡Acceso exitoso! Bienvenido(a), ${r.nombres}.`);
        return router.push(r.rol === "admin" ? "/admin" : "/dashboard");
      }
      const error = await registrar({
        ...datos,
        correo: datos.correo.trim(),
        telefono: datos.telefono.replace(/\s/g, ""),
      });
      if (error) {
        setErrores({ correo: error });
        setMessage({ text: error, type: "error" });
        return;
      }
      cambiarTab("login", datos.correo.trim());
      setMessage({ text: "¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta guardada en PostgreSQL.", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado al conectar con el servidor.";
      setMessage({ text: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function usarDemo(rol: keyof typeof CREDENCIALES_DEMO) {
    cambiarTab("login");
    setDatos({ ...VACIO, ...CREDENCIALES_DEMO[rol] });
  }

  return (
    /* ----------------------------------------IMAGEN DE FONDO--------------------------------------------------*/
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{ backgroundImage: "url('/fondoLogin.png')" }}>
      {/* ---------------------------------MURAL DE COMERCIO INFORMAL---------------------------------------------*/}
      {/* Solo en pantallas anchas y en la pestaña de login, para no solaparse con el formulario */}
      <div className={`absolute left-[3vw] aspect-[3/2] w-[25vw] max-w-[600px] bg-contain bg-center bg-no-repeat opacity-90 mask-x-from-90% mask-y-from-90% ${registro ? "hidden" : "hidden xl:block"}`}
        style={{ backgroundImage: "url('/mural.png')" }} />

      {/* ---------------------------------------------FORMULARIO--------------------------------------------*/}
      <form onSubmit={handleSubmit} noValidate
        className={`relative flex w-full flex-col items-center gap-4 rounded-[30px] border-2 border-green-900 bg-white/90 px-4 py-6 shadow-xl sm:px-8 sm:py-10 ${registro ? "max-w-xl" : "max-w-md"}`}>
        {/* Tabs con píldora deslizante */}
        <div className="relative flex w-full overflow-hidden rounded-full border-2 border-green-900 bg-lime-500">
          <div className={`absolute inset-y-0 w-1/2 rounded-full bg-green-900 transition-transform duration-300 ${registro ? "translate-x-full" : ""}`} />
          {(["login", "register"] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => cambiarTab(tab)}
              className={`relative z-10 flex-1 cursor-pointer rounded-full px-2 py-3 text-sm font-bold transition-colors sm:text-base ${activeTab === tab ? "text-white" : "text-green-900 hover:text-white"}`}>
              {tab === "login" ? "Iniciar Sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        <h1 className={`${bebas.className} mt-4 text-center text-3xl text-green-700 lg:text-4xl`}>
          {registro ? "¡CREA TU CUENTA EN ZERKA!" : "¡BIENVENIDO A ZERKA!"}
        </h1>

        {message.text && (
          <p role="status" className={`w-full rounded-lg border p-3 text-center text-sm font-semibold ${message.type === "success" ? "border-green-300 bg-green-100 text-green-800" : "border-red-300 bg-red-100 text-red-800"}`}>
            {message.text}
          </p>
        )}

        {/* -----------------------------------------INPUTS--------------------------------------------------*/}
        <div className={`grid w-full gap-4 ${registro ? "sm:grid-cols-2" : ""}`}>
          {registro && (<>
            <Campo label="Nombres" error={errores.nombres}><input {...campo("nombres")} placeholder="Ingresa tus nombres" autoComplete="given-name" /></Campo>
            <Campo label="Apellidos" error={errores.apellidos}><input {...campo("apellidos")} placeholder="Ingresa tus apellidos" autoComplete="family-name" /></Campo>
            <Campo label="Teléfono" error={errores.telefono}><input {...campo("telefono")} type="tel" inputMode="numeric" placeholder="3001234567" autoComplete="tel" /></Campo>
            <Campo label="Fecha de nacimiento" error={errores.nacimiento}><input {...campo("nacimiento")} type="date" /></Campo>
            <Campo label="Género" error={errores.genero}>
              <select {...campo("genero")}><option value="" disabled>Selecciona una opción</option>{GENEROS.map((g) => <option key={g}>{g}</option>)}</select>
            </Campo>
            <Campo label="Ciudad" error={errores.ciudad}>
              <select {...campo("ciudad")}><option value="" disabled>Selecciona tu ciudad</option>{CIUDADES.map((c) => <option key={c}>{c}</option>)}</select>
            </Campo>
            <Campo label="Barrio" error={errores.barrio} className="sm:col-span-2">
              <select {...campo("barrio")}><option value="" disabled>Selecciona tu barrio</option>{BARRIOS.map((b) => <option key={b}>{b}</option>)}</select>
            </Campo>
          </>)}

          <Campo label="Correo electrónico" error={errores.correo}>
            <input {...campo("correo")} type="email" placeholder="Ingresa tu correo electrónico" autoComplete="email" />
          </Campo>
          <Campo label="Contraseña" error={errores.clave} ayuda={registro ? "Mínimo 8 caracteres, con letras y números." : undefined}
            extra={
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-600 hover:text-green-900">
                {showPassword ? <LuEyeOff className="size-5" /> : <LuEye className="size-5" />}
              </button>
            }>
            <input {...campo("clave")} type={showPassword ? "text" : "password"} placeholder="Ingresa tu contraseña"
              autoComplete={registro ? "new-password" : "current-password"} className="input pr-11" />
          </Campo>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primario mt-2 w-full py-3 text-base">
          {loading ? "Procesando..." : registro ? "Registrarse" : "Iniciar Sesión"}
        </button>
      </form>

      {/* ------------------------------------ACCESO RÁPIDO CON CUENTAS DE POSTGRESQL----------------------------------------*/}
      <aside className="w-full max-w-md rounded-2xl border border-green-900/20 bg-white/85 p-4 text-xs text-stone-600 shadow">
        <p className="mb-2 flex items-center gap-1.5 font-bold text-green-900"><LuKeyRound /> Cuentas registradas en PostgreSQL</p>
        <p className="mb-3">Admin: <code>{CREDENCIALES_DEMO.admin.correo}</code> · Usuario: <code>{CREDENCIALES_DEMO.usuario.correo}</code></p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secundario btn-sm" onClick={() => usarDemo("admin")}><LuShieldCheck /> Cargar administrador</button>
          <button type="button" className="btn btn-secundario btn-sm" onClick={() => usarDemo("usuario")}><LuUser /> Cargar usuario normal</button>
        </div>
        <p className="mt-3 text-[11px] text-green-700 font-medium">✓ Conectado a tu base de datos PostgreSQL local en tiempo real.</p>
      </aside>

      {/* ------------------------------------------------------FOOTER--------------------------------------------------------------*/}
      <div className="rounded-lg bg-gray-800/90 p-3 text-center text-sm text-white sm:fixed sm:right-5 sm:bottom-5 sm:p-4">
        <p>Hecho con esfuerzo,<br />Hecho local💚</p>
      </div>
    </div>
  );
};

export default Login;
