import { Eva, ItemState } from "@eva-ics/webengine";
import { get_engine } from "@eva-ics/webengine-react";
import { Autocomplete, TextField, ThemeProvider } from "@mui/material";
import { THEME } from "../common";

export interface EditOIDParams {
  kind?: string;
}

export const EditOID = ({
  current_value,
  setParam,
  params
}: {
  current_value: string;
  setParam: (a: any) => void;
  params?: EditOIDParams;
}): JSX.Element => {
  const engine = get_engine() as Eva;
  let states = engine.state("*") as Array<ItemState>;
  states.sort();
  if (params?.kind) {
    const kind = `${params.kind}:`;
    states = states.filter((s) => s?.oid?.startsWith(kind));
  }
  return (
    <ThemeProvider theme={THEME}>
      <Autocomplete
        fullWidth
        freeSolo
        disableClearable
        options={states.map((s) => s.oid)}
        value={current_value || ""}
        onChange={(_, val) => {
          setParam(val ? val : undefined);
        }}
        renderInput={(params) => (
          <TextField
            variant="standard"
            {...params}
            InputProps={{
              ...params.InputProps,
              type: "search"
            }}
          />
        )}
      />
    </ThemeProvider>
  );
};
