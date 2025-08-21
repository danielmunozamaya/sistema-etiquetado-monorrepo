import type { ReactNode } from "react";

import { useEffect, useState } from "react";
import "./DesktopOnlyGuard.css";
import desktopOnlyGif from "../../assets/desktop_only_gif.gif";
import { i18n } from "../../i18n";

const MIN_WIDTH = 1200;

interface DesktopOnlyGuardProps {
  children: ReactNode;
}

export const DesktopOnlyGuard: React.FC<DesktopOnlyGuardProps> = ({
  children,
}) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= MIN_WIDTH);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= MIN_WIDTH);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="desktop-only-guard-root">
        <h1 className="desktop-only-guard-title">{i18n.desktopOnly.title}</h1>
        <img
          src={desktopOnlyGif}
          alt={i18n.desktopOnly.imgAlt}
          className="desktop-only-guard-img"
        />
        <p className="desktop-only-guard-msg">{i18n.desktopOnly.message}</p>
      </div>
    );
  }

  return <>{children}</>;
};
