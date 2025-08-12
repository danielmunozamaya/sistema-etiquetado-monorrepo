let navigate;

export const setNavigate = (navFn) => {
  navigate = navFn;
};

export const navigateTo = (route) => {
  if (navigate) {
    navigate(route);
  } else {
    window.location.href = route;
  }
};
