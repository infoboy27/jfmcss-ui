"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { StoredProject } from "@/lib/portfolio";

// ── Config ────────────────────────────────────────────────────────────────────
// Número de WhatsApp con código de país (RD = 1): +1 849 401 2358
const WHATSAPP_NUMBER = "18494012358";
const DEFAULT_LANG: Lang = "es";
const ANIMATION_SPEED = 1;

type Lang = "es" | "en";

// ── i18n ──────────────────────────────────────────────────────────────────────
const I18N = {
  es: {
    navServices: "Servicios",
    navAbout: "Nosotros",
    navWork: "Portafolio",
    navContact: "Contacto",
    badge: "software studio",
    heroTitle1: "Convertimos ideas en",
    heroTitle2: "software que funciona",
    heroSub:
      "Apps móviles, plataformas web y soluciones digitales a la medida. Desarrollo moderno, práctico y orientado a resolver necesidades reales.",
    ctaPrimary: "Inicia tu proyecto",
    ctaSecondary: "Ver trabajo",
    servicesTitle: "Servicios",
    aboutTitle: "Sobre nosotros",
    aboutBody1:
      "JFMCSS es un estudio de desarrollo de software que combina ingeniería, diseño de producto y nuevas tecnologías para construir aplicaciones funcionales, escalables y fáciles de usar.",
    aboutBody2:
      "Trabajamos con empresas, profesionales y emprendedores que necesitan convertir una idea en un producto digital real — desde el prototipo hasta la infraestructura en producción.",
    workTitle: "Portafolio",
    contactTitle: "Hablemos",
    contactBody:
      "Cuéntanos qué quieres construir. Respondemos en menos de 24 horas.",
    formName: "Nombre",
    formEmail: "Email",
    formMessage: "¿Qué quieres construir?",
    formSend: "Enviar mensaje",
    formThanks: "✓ Te llevamos a WhatsApp para enviar tu mensaje. Te contactaremos pronto.",
    waIntro: "Hola JFMCSS, quiero cotizar un proyecto.",
    waName: "Nombre",
    waMessage: "Mensaje",
    footerTag: "construido con código y café",
    waLabel: "Escríbenos",
    waText: "Hola JFMCSS, quiero cotizar un proyecto",
    langButton: "ES → EN",
    noImg: "sin imagen — agrégala en el admin",
    trustedLabel: "Empresas que confían en nosotros",
  },
  en: {
    navServices: "Services",
    navAbout: "About",
    navWork: "Work",
    navContact: "Contact",
    badge: "software studio",
    heroTitle1: "We turn ideas into",
    heroTitle2: "software that works",
    heroSub:
      "Mobile apps, web platforms and custom digital solutions. Modern, practical development focused on solving real needs.",
    ctaPrimary: "Start your project",
    ctaSecondary: "See our work",
    servicesTitle: "Services",
    aboutTitle: "About us",
    aboutBody1:
      "JFMCSS is a software development studio combining engineering, product design and new technologies to build functional, scalable, easy-to-use applications.",
    aboutBody2:
      "We work with companies, professionals and founders who need to turn an idea into a real digital product — from prototype to production infrastructure.",
    workTitle: "Work",
    contactTitle: "Let's talk",
    contactBody: "Tell us what you want to build. We reply within 24 hours.",
    formName: "Name",
    formEmail: "Email",
    formMessage: "What do you want to build?",
    formSend: "Send message",
    formThanks: "✓ Taking you to WhatsApp to send your message. We will get back to you soon.",
    waIntro: "Hi JFMCSS, I want a project quote.",
    waName: "Name",
    waMessage: "Message",
    footerTag: "built with code & coffee",
    waLabel: "Chat with us",
    waText: "Hi JFMCSS, I want a project quote",
    langButton: "EN → ES",
    noImg: "no image — add it in the admin",
    trustedLabel: "Companies that trust us",
  },
} as const;

// logos de clientes/proyectos para la franja "trusted by" — agrega más entradas
// aquí cuando tengamos nuevos logos (archivo en public/assets/clients/)
const TRUSTED_LOGOS: { name: string; img: string }[] = [
  { name: "Reset Bariatric Surgery", img: "/assets/clients/reset.png" },
  { name: "IMLA Wellness Center", img: "/assets/clients/imla.png" },
];

// Lucide icons (https://lucide.dev, ISC license — free for commercial use)
// Phosphor Icons duotone (https://phosphoricons.com, MIT license — free for commercial use)
// each icon has a soft background shape + a solid foreground shape, recolored to
// currentColor at two opacities so it reads well on the brand's gradient diamonds
const ICON_PATHS: Record<string, string> = {
  smartphone:
    '<path opacity="0.4" d="M192,56V200H64V56Z"/><path d="M176,16H80A24,24,0,0,0,56,40V216a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V40A24,24,0,0,0,176,16ZM72,64H184V192H72Zm8-32h96a8,8,0,0,1,8,8v8H72V40A8,8,0,0,1,80,32Zm96,192H80a8,8,0,0,1-8-8v-8H184v8A8,8,0,0,1,176,224Z"/>',
  code:
    '<path opacity="0.4" d="M240,128l-48,40H64L16,128,64,88H192Z"/><path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"/>',
  zap:
    '<path opacity="0.4" d="M96,240l16-80L48,136,160,16,144,96l64,24Z"/><path d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17ZM109.37,214l10.47-52.38a8,8,0,0,0-5-9.06L62,132.71l84.62-90.66L136.16,94.43a8,8,0,0,0,5,9.06l52.8,19.8Z"/>',
  database:
    '<path opacity="0.4" d="M216,80c0,26.51-39.4,48-88,48S40,106.51,40,80s39.4-48,88-48S216,53.49,216,80Z"/><path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64ZM69.61,53.08C85.07,44.65,105.81,40,128,40s42.93,4.65,58.39,13.08C200.12,60.57,208,70.38,208,80s-7.88,19.43-21.61,26.92C170.93,115.35,150.19,120,128,120s-42.93-4.65-58.39-13.08C55.88,99.43,48,89.62,48,80S55.88,60.57,69.61,53.08ZM186.39,202.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z"/>',
  "pen-tool":
    '<path opacity="0.4" d="M128,48,68.32,70.38a8,8,0,0,0-5.08,6.17L40,216l139.45-23.24a8,8,0,0,0,6.17-5.08L208,128Zm-4,104a20,20,0,1,1,20-20A20,20,0,0,1,124,152Z"/><path d="M248,92.68a15.86,15.86,0,0,0-4.69-11.31L174.63,12.68a16,16,0,0,0-22.63,0L123.57,41.11l-58,21.77A16.06,16.06,0,0,0,55.35,75.23L32.11,214.68A8,8,0,0,0,40,224a8.4,8.4,0,0,0,1.32-.11l139.44-23.24a16,16,0,0,0,12.35-10.17l21.77-58L243.31,104A15.87,15.87,0,0,0,248,92.68Zm-69.87,92.19L63.32,204l47.37-47.37a28,28,0,1,0-11.32-11.32L52,192.7,71.13,77.86,126,57.29,198.7,130ZM112,132a12,12,0,1,1,12,12A12,12,0,0,1,112,132Zm96-15.32L139.31,48l24-24L232,92.68Z"/>',
  "arrow-left-right":
    '<path opacity="0.4" d="M208,80v96H48V80Z"/><path d="M213.66,181.66l-32,32a8,8,0,0,1-11.32-11.32L188.69,184H48a8,8,0,0,1,0-16H188.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,213.66,181.66Zm-139.32-64a8,8,0,0,0,11.32-11.32L67.31,88H208a8,8,0,0,0,0-16H67.31L85.66,53.66A8,8,0,0,0,74.34,42.34l-32,32a8,8,0,0,0,0,11.32Z"/>',
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      width="26"
      height="26"
      fill="currentColor"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  );
}

const SERVICES: Record<Lang, { icon: string; title: string; desc: string }[]> = {
  es: [
    { icon: "smartphone", title: "Apps móviles", desc: "Aplicaciones iOS y Android nativas o multiplataforma, desde el MVP hasta la publicación en tiendas." },
    { icon: "code", title: "Plataformas web", desc: "Portales, dashboards y productos SaaS con arquitecturas modernas y rendimiento real." },
    { icon: "zap", title: "Automatización", desc: "Flujos y procesos automatizados que eliminan trabajo manual e integran tus herramientas." },
    { icon: "database", title: "Infraestructura", desc: "Nodos, servidores, bases de datos y despliegues confiables, monitoreados y escalables." },
    { icon: "pen-tool", title: "Diseño de producto", desc: "UX/UI centrado en el usuario: de la idea al prototipo navegable antes de escribir código." },
    { icon: "arrow-left-right", title: "Integraciones & APIs", desc: "Conectamos sistemas: pagos, CRMs, datos externos y servicios de terceros vía API." },
  ],
  en: [
    { icon: "smartphone", title: "Mobile apps", desc: "Native or cross-platform iOS and Android apps, from MVP to app-store launch." },
    { icon: "code", title: "Web platforms", desc: "Portals, dashboards and SaaS products with modern architectures and real performance." },
    { icon: "zap", title: "Automation", desc: "Automated flows and processes that remove manual work and connect your tools." },
    { icon: "database", title: "Infrastructure", desc: "Nodes, servers, databases and reliable, monitored, scalable deployments." },
    { icon: "pen-tool", title: "Product design", desc: "User-centered UX/UI: from idea to clickable prototype before writing code." },
    { icon: "arrow-left-right", title: "Integrations & APIs", desc: "We connect systems: payments, CRMs, external data and third-party services via API." },
  ],
};

const STATS: Record<Lang, { value: string; label: string }[]> = {
  es: [
    { value: "+10", label: "años programando" },
    { value: "+30", label: "proyectos entregados" },
    { value: "24h", label: "tiempo de respuesta" },
    { value: "100%", label: "a la medida" },
  ],
  en: [
    { value: "+10", label: "years coding" },
    { value: "+30", label: "projects shipped" },
    { value: "24h", label: "response time" },
    { value: "100%", label: "custom built" },
  ],
};

const FALLBACK_PROJECTS: Record<
  Lang,
  { tag: string; title: string; desc: string; placeholder: string }[]
> = {
  es: [
    { tag: "App móvil", title: "Proyecto destacado 1", desc: "Administra estos proyectos desde la página admin (enlace en el pie).", placeholder: "screenshot app móvil" },
    { tag: "Plataforma web", title: "Proyecto destacado 2", desc: "Administra estos proyectos desde la página admin (enlace en el pie).", placeholder: "screenshot plataforma web" },
    { tag: "Automatización", title: "Proyecto destacado 3", desc: "Administra estos proyectos desde la página admin (enlace en el pie).", placeholder: "screenshot dashboard" },
  ],
  en: [
    { tag: "Mobile app", title: "Featured project 1", desc: "Manage these projects from the admin page (link in the footer).", placeholder: "screenshot app móvil" },
    { tag: "Web platform", title: "Featured project 2", desc: "Manage these projects from the admin page (link in the footer).", placeholder: "screenshot plataforma web" },
    { tag: "Automation", title: "Featured project 3", desc: "Manage these projects from the admin page (link in the footer).", placeholder: "screenshot dashboard" },
  ],
};

export default function Landing() {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [sent, setSent] = useState(false);
  const [portfolio, setPortfolio] = useState<StoredProject[] | null>(null);
  const canvasHost = useRef<HTMLDivElement>(null);

  const es = lang === "es";
  const t = I18N[lang];

  const refreshPortfolio = useCallback(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((d: { projects?: StoredProject[] }) => {
        setPortfolio(
          Array.isArray(d.projects) && d.projects.length ? d.projects : null,
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("jfmcss-lang");
    if (saved === "es" || saved === "en") setLang(saved);
    refreshPortfolio();
    const onFocus = () => refreshPortfolio();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshPortfolio]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    const next: Lang = es ? "en" : "es";
    setLang(next);
    localStorage.setItem("jfmcss-lang", next);
  };

  // ── Escena 3D (Three.js) ────────────────────────────────────────────────────
  useEffect(() => {
    const host = canvasHost.current;
    if (!host) return;

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);

    const W = () => host.clientWidth;
    const H = () => host.clientHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070d, 0.055);
    const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 100);
    camera.position.set(0, 0.4, 11);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    // mantiene la figura en el lado derecho del área visible en cualquier zoom/aspecto
    const fit = () => {
      const aspect = W() / Math.max(1, H());
      const halfW = Math.tan(((camera.fov / 2) * Math.PI) / 180) * camera.position.z * aspect;
      group.position.x = Math.max(2.2, Math.min(halfW * 0.52, 7));
      const s = Math.max(0.65, Math.min(1, aspect / 1.7));
      group.scale.set(s, s, s);
    };
    fit();

    // red de nodos
    const NODES = 46,
      R = 3.4;
    const nodePos: THREE.Vector3[] = [];
    for (let i = 0; i < NODES; i++) {
      const phi = Math.acos(2 * Math.random() - 1),
        th = Math.random() * Math.PI * 2;
      const r = R * (0.55 + Math.random() * 0.45);
      nodePos.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(th),
          r * Math.cos(phi) * 0.8,
          r * Math.sin(phi) * Math.sin(th),
        ),
      );
    }
    const nodeGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const nodeMatA = new THREE.MeshBasicMaterial({ color: 0x00cafe });
    const nodeMatB = new THREE.MeshBasicMaterial({ color: 0x4a78ec });
    const pulses: THREE.Mesh[] = [];
    nodePos.forEach((p, i) => {
      const m = new THREE.Mesh(nodeGeo, i % 3 === 0 ? nodeMatA : nodeMatB);
      m.position.copy(p);
      m.userData.base = 0.7 + Math.random() * 0.9;
      m.userData.ph = Math.random() * Math.PI * 2;
      group.add(m);
      pulses.push(m);
    });
    // aristas entre vecinos cercanos
    const edges: THREE.Vector3[] = [];
    for (let i = 0; i < NODES; i++)
      for (let j = i + 1; j < NODES; j++) {
        if (nodePos[i].distanceTo(nodePos[j]) < 1.9) edges.push(nodePos[i], nodePos[j]);
      }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(edges);
    const lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({ color: 0x1050d0, transparent: true, opacity: 0.35 }),
    );
    group.add(lines);

    // cilindros de base de datos
    const db = new THREE.Group();
    const dbMat = new THREE.MeshBasicMaterial({ color: 0x4a78ec, wireframe: true, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 3; i++) {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.42, 22, 1), dbMat);
      cyl.position.y = i * 0.62 - 0.62;
      db.add(cyl);
    }
    db.position.set(-1.4, -2.2, 1.2);
    db.scale.set(0.9, 0.9, 0.9);
    group.add(db);

    // fragmentos de código flotantes
    const makeTextSprite = (text: string, color: string) => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 128;
      const ctx = c.getContext("2d")!;
      ctx.font = '500 54px "JetBrains Mono", monospace';
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 256, 64);
      const tex = new THREE.CanvasTexture(c);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.85 });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(3.2, 0.8, 1);
      return sp;
    };
    const frags: THREE.Sprite[] = [];
    const texts: [string, string][] = [
      ["</>", "#00cafe"],
      ["{ api }", "#7d8fd0"],
      ["deploy()", "#4a78ec"],
      ["SELECT *", "#00cafe"],
      ["npm run build", "#7d8fd0"],
    ];
    texts.forEach(([txt, col], i) => {
      const sp = makeTextSprite(txt, col);
      const a = (i / texts.length) * Math.PI * 2;
      sp.userData = { a, r: 4.6 + (i % 2) * 0.9, y: -1.5 + i * 0.9, sp: 0.12 + (i % 3) * 0.04 };
      group.add(sp);
      frags.push(sp);
    });

    // partículas ambientales
    const pGeo = new THREE.BufferGeometry();
    const pCount = 350,
      pArr = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) pArr[i] = (Math.random() - 0.5) * 30;
    pGeo.setAttribute("position", new THREE.BufferAttribute(pArr, 3));
    const points = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0x3a4a75, size: 0.045, transparent: true, opacity: 0.7 }),
    );
    scene.add(points);

    const onResize = () => {
      camera.aspect = W() / Math.max(1, H());
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
      fit();
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      const time = clock.getElapsedTime();
      const speed = ANIMATION_SPEED;
      group.rotation.y = time * 0.08 * speed + mouse.x * 0.35;
      group.rotation.x = mouse.y * 0.18;
      db.rotation.y = time * 0.4 * speed;
      pulses.forEach((m) => {
        const s = m.userData.base + Math.sin(time * 1.6 * speed + m.userData.ph) * 0.35;
        m.scale.set(s, s, s);
      });
      frags.forEach((f) => {
        const a = f.userData.a + time * f.userData.sp * speed;
        f.position.set(
          Math.cos(a) * f.userData.r,
          f.userData.y + Math.sin(time * 0.7 + f.userData.a) * 0.3,
          Math.sin(a) * f.userData.r,
        );
      });
      points.rotation.y = time * 0.01 * speed;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  const projects = portfolio
    ? portfolio.map((pr) => ({
        tag: (es ? pr.tag : pr.tagEn || pr.tag) || "",
        title: (es ? pr.title : pr.titleEn || pr.title) || "",
        desc: (es ? pr.desc : pr.descEn || pr.desc) || "",
        img: pr.img || null,
        placeholder: t.noImg,
      }))
    : FALLBACK_PROJECTS[lang].map((pr) => ({ ...pr, img: null as string | null }));

  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(t.waText)}`;

  return (
    <div>
      {/* NAV */}
      <nav className="main-nav">
        <a href="#top" className="nav-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-light.png" alt="JFMCSS" />
          <span>JFMCSS</span>
        </a>
        <div className="nav-links">
          <a href="#servicios" className="nav-link">{t.navServices}</a>
          <a href="#nosotros" className="nav-link">{t.navAbout}</a>
          <a href="#portafolio" className="nav-link">{t.navWork}</a>
          <a href="#contacto" className="nav-link">{t.navContact}</a>
          <button type="button" className="lang-btn" onClick={toggleLang}>
            {t.langButton}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header id="top">
        <div id="canvas-host" ref={canvasHost} />
        <div className="hero-fade" />
        <div className="hero-wrap">
          <div className="hero-inner">
            <div className="hero-badge">
              <span className="dot" />
              {t.badge}
            </div>
            <h1 className="hero-title">
              {t.heroTitle1} <span className="grad">{t.heroTitle2}</span>
            </h1>
            <p className="hero-sub">{t.heroSub}</p>
            <div className="hero-ctas">
              <a href="#contacto" className="cta-primary">{t.ctaPrimary} →</a>
              <a href="#portafolio" className="cta-secondary">{t.ctaSecondary}</a>
            </div>
            <div className="hero-tags">
              <span>{"// apps"}</span>
              <span>{"// web"}</span>
              <span>{"// data"}</span>
              <span>{"// automation"}</span>
            </div>
          </div>
        </div>
        <div className="scroll-hint">▼ scroll</div>
      </header>

      {/* TRUSTED BY */}
      <div className="trusted-strip">
        <div className="trusted-label">
          <span className="dot" />
          {t.trustedLabel}
        </div>
        <div className="trusted-logos">
          {TRUSTED_LOGOS.map((logo) => (
            <div className="trusted-logo" key={logo.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.img} alt={logo.name} />
            </div>
          ))}
        </div>
      </div>

      {/* SERVICIOS */}
      <section id="servicios">
        <div className="section-head">
          <span className="num">01</span>
          <h2>{t.servicesTitle}</h2>
        </div>
        <div className="services-grid">
          {SERVICES[lang].map((svc, i) => (
            <div className="svc-card" key={svc.icon}>
              <div className={`svc-icon accent-${"abc"[i % 3]}`}>
                <Icon name={svc.icon} />
              </div>
              <h3>{svc.title}</h3>
              <p>{svc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE NOSOTROS */}
      <section id="nosotros">
        <div className="about-wrap">
          <div className="about-text">
            <div className="section-head">
              <span className="num">02</span>
              <h2>{t.aboutTitle}</h2>
            </div>
            <p>{t.aboutBody1}</p>
            <p>{t.aboutBody2}</p>
          </div>
          <div className="stats-grid">
            {STATS[lang].map((st) => (
              <div className="stat-card" key={st.label}>
                <div className="value">{st.value}</div>
                <div className="label">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTAFOLIO */}
      <section id="portafolio">
        <div className="section-head">
          <span className="num">03</span>
          <h2>{t.workTitle}</h2>
        </div>
        <div className="work-grid">
          {projects.map((pr, i) => (
            <div className="work-item" key={i}>
              <div className="work-img">
                {pr.img ? (
                  <div
                    className="img"
                    role="img"
                    aria-label={pr.title}
                    style={{ backgroundImage: `url("${pr.img}")` }}
                  />
                ) : (
                  <div className="placeholder">{pr.placeholder}</div>
                )}
              </div>
              <div>
                <div className="tag">{pr.tag}</div>
                <h3>{pr.title}</h3>
                <p>{pr.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto">
        <div className="contact-wrap">
          <div className="contact-text">
            <div className="section-head">
              <span className="num">04</span>
              <h2>{t.contactTitle}</h2>
            </div>
            <p>{t.contactBody}</p>
            <div className="contact-email">hello@jfmcss.com</div>
          </div>
          {sent ? (
            <div className="form-thanks">{t.formThanks}</div>
          ) : (
            <form
              className="contact-form"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const msg = [
                  t.waIntro,
                  "",
                  `${t.waName}: ${fd.get("name")}`,
                  `Email: ${fd.get("email")}`,
                  `${t.waMessage}: ${fd.get("message")}`,
                ].join("\n");
                window.open(
                  `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`,
                  "_blank",
                  "noopener",
                );
                setSent(true);
              }}
            >
              <input name="name" required placeholder={t.formName} />
              <input name="email" type="email" required placeholder={t.formEmail} />
              <textarea name="message" required rows={5} placeholder={t.formMessage} />
              <button type="submit">{t.formSend}</button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-light.png" alt="" />
          <span className="footer-note">© 2026 JFMCSS · jfmcss.com</span>
          <a href="/admin" className="admin-link">[admin]</a>
        </div>
        <span className="footer-note">{t.footerTag}</span>
      </footer>

      {/* WHATSAPP FLOTANTE */}
      <a href={waLink} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="wa-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5 13.9c-.2.6-1.2 1.1-1.7 1.2-.4 0-.9.2-3.1-.6-2.6-1-4.3-3.7-4.4-3.9-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.7 1.8.8 1.9c.1.1.1.3 0 .5l-.4.6c-.1.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.1.1.5-.2 1.2z" />
        </svg>
        {t.waLabel}
      </a>
    </div>
  );
}
