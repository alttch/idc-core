import { useEvaAPICall } from "@eva-ics/webengine-react";
import { Autocomplete, TextField, ThemeProvider } from "@mui/material";
import { THEME } from "../common";
import { useEffect, useMemo, useState } from "react";

export interface EditOIDParams {
  kind?: string;
}

export const EditOID = ({
  current_value,
  setParam,
  notifyGlobalChange,
  params,
}: {
  current_value: string;
  setParam: (a: any) => void;
  notifyGlobalChange?: () => void;
  params?: EditOIDParams;
}): JSX.Element => {
  const [inputValue, setInputValue] = useState(current_value);

  useEffect(() => {
    setInputValue(current_value);
  }, [current_value]);

  const handleSaveValue = (value: string) => {
    setParam(value);
    if (notifyGlobalChange) {
      notifyGlobalChange();
    }
  };

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
        value={inputValue || ""}
        onInputChange={(_, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(_, val) => {
          const newValue = val ? val : inputValue;
          handleSaveValue(newValue);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSaveValue(inputValue);
            (e.target as HTMLInputElement).blur();
          }
        }}
        onFocus={() => {
          handleSaveValue(inputValue);
        }}
        onBlur={() => {
          handleSaveValue(inputValue);
        }}
        renderInput={(params) => (
          <TextField
            variant="standard"
            {...params}
            InputProps={{
              ...params.InputProps,
              type: "search",
            }}
          />
        )}
      />
    </ThemeProvider>
  );
};
