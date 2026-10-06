"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/alertes", label: "Alertes" },
  { href: "/alertes/nouvelle", label: "Créer" },
  { href: "/historique", label: "Historique" },
  { href: "/parametres", label: "Notifications" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link key={link.href} href={link.href} className={active ? "active" : ""}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
