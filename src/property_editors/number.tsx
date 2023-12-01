import { useEffect, useRef, useState } from "react";
import { TextField, ThemeProvider } from "@mui/material";
import { THEME } from "../common";
import { ErrorBar } from "../components/sidebar";
import { parseNumber } from "bmat/numbers";

export const EditNumber = ({
  element_id,
  update_key,
  current_value,
  setParam,
  params
}: {
  element_id: string;
  update_key?: any;
  current_value: number;
  setParam: (a: any) => void;
  params?: any;
}): JSX.Element => {
  const [input_value, setInputValue] = useState(
    current_value === undefined ? "" : current_value.toString()
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setInputValue(current_value === undefined ? "" : current_value.toString());
  }, [element_id, update_key]);

  return (
    <div>
      <ThemeProvider theme={THEME}>
        <TextField
          ref={currentInput}
          fullWidth
          type="number"
          value={input_value}
          variant="standard"
          onChange={(e) => {
            try {
              const value = e.target.value;
              setInputValue(value);
              setParam(parseNumber(value, params));
              if (setErrorMessage) {
                setErrorMessage(null);
              }
            } catch (e: any) {
              if (setErrorMessage) {
                setErrorMessage(e.toString());
              }
            }
          }}
        />
      </ThemeProvider>
      {errorMessage && <ErrorBar message={errorMessage} />}
    </div>
  );
};
