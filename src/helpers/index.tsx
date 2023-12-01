export const getTheme = () => {
  const theme = `${window?.localStorage?.getItem("theme")}`;
  if (["light", "dark"].includes(theme)) return theme;

  const userMedia = window.matchMedia("(prefers-color-scheme: light)");
  if (userMedia.matches) return "light";

  return "dark";
};
