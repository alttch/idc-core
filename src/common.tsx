import { createTheme } from "@mui/material";
import { rangeArray } from "bmat/numbers";

export enum OnlineState {
  Offline = "Offline",
  Working = "Working",
  Online = "Online"
}

export const THEME = createTheme({
  typography: {
    fontSize: 12
  }
});
//
//const colors = [
//"",
//"black",
//"white",
//"red",
//"green",
//"blue",
//"yellow",
//"orange",
//"purple",
//"pink",
//"brown",
//"gray",
//"lightgray",
//"darkgray",
//"lightblue",
//"cyan",
//"magenta",
//"lime",
//"teal",
//"olive",
//"navy",
//"maroon",
//"silver",
//"gold",
//"violet",
//"indigo",
//"turquoise",
//"salmon",
//"coral",
//"tomato",
//"hotpink",
//"sienna",
//"khaki"
//];

export const DEFAULT_NAME = "untitled";

export const DEFAULT_GRID = 20;

export const DEFAULT_VIEWPORT = { x: 900, y: 600 };

export const MIN_SIDEBAR_WIDTH = 350;

export const DIMENSIONS = rangeArray(300, 2000, 100);

export const GRIDS = [1, 5, 10, 15, 20, 25, 30, 50];

export const fontWeight = (bold: boolean): string => {
  return bold ? "bold" : "normal";
};
