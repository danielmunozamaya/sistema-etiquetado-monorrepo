import type { NavigateFunction } from "react-router-dom";

let navigate: NavigateFunction | undefined;

export const setNavigate = (navFn: NavigateFunction) => {
  navigate = navFn;
};

export const navigateTo = (route: string) => {
  if (navigate) {
    navigate(route);
  } else {
    window.location.href = route;
  }
};
