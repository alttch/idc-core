import { useEvaAPICall } from "@eva-ics/webengine-react";
import { Autocomplete, TextField, ThemeProvider } from "@mui/material";
import { THEME } from "../common";
import { useMemo } from "react";

export interface EditOIDParams {
  kind?: string;
}

export const EditOID = ({
  current_value,
  setParam,
  notifyGlobalChange,
  params
}: {
  current_value: string;
  setParam: (a: any) => void;
  notifyGlobalChange?: () => void;
  params?: EditOIDParams;
}): JSX.Element => {
  const i = useMemo(() => {
    return params?.kind ? `${params.kind}:#` : "#";
  }, [params?.kind]);
  const states = useEvaAPICall(
    { method: "item.state", params: { i }, update: 10 },
    [i]
  );
  if (!states.data) {
    return <></>;
  }
  return (
    <ThemeProvider theme={THEME}>
      <Autocomplete
        fullWidth
        freeSolo
        disableClearable
        options={states.data.map((s: any) => s.oid)}
        value={current_value || ""}
        onChange={(_, val) => {
          setParam(val ? val : undefined);
          if (notifyGlobalChange) {
            notifyGlobalChange();
          }
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
