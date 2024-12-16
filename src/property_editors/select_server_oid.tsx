import { get_engine } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { THEME } from "../common";
import { Autocomplete, TextField, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";

export const EditSelectServerOID = ({
  current_value = "",
  setParam,
  params,
}: {
  current_value: string;
  setParam: (a: string) => void;
  params?: { i?: Array<string> | string; src?: string };
}): JSX.Element => {
  const eva = get_engine() as Eva;

  const [oid_list, setOIDList] = useState<Array<string>>([]);
  const [inputValue, setInputValue] = useState(current_value);

  useEffect(() => {
    if (eva?.server_info?.acl?.admin) {
      eva
        .call("bus::eva.core::item.list", { i: params?.i, src: params?.src })
        .then((items) => {
          setOIDList(items.map((item: any) => item.oid));
        });
    }
  }, [params]);

  useEffect(() => {
    setInputValue(current_value);
  }, [current_value]);

  const handleSaveValue = (value: string) => {
    setParam(value);
  };

  if (eva?.server_info?.acl?.admin) {
    return (
      <ThemeProvider theme={THEME}>
        <Autocomplete
          fullWidth
          freeSolo
          options={oid_list}
          disableClearable
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
  } else {
    return (
      <>
        <TextField
          fullWidth
          type="text"
          // size={params?.size}
          value={inputValue || ""}
          onChange={(e) => {
            setInputValue(e.target.value);
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
        />
      </>
    );
  }
};
