declare module "bootstrap/dist/js/bootstrap.bundle.min.js";

interface BootstrapModal {
  show: () => void;
  hide: () => void;
}

interface BootstrapStatic {
  Modal: {
    new (element: HTMLElement | null): BootstrapModal;
    getInstance(element: HTMLElement | null): BootstrapModal;
    getOrCreateInstance(element: HTMLElement | null): BootstrapModal;
  };
}

interface Window {
  bootstrap: BootstrapStatic;
}
