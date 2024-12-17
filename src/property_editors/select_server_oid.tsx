import { get_engine } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { THEME } from "../common";
import { Autocomplete, TextField, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";

export const EditSelectServerOID = ({
  current_value = "",
  setParam,
  params,
  notifyGlobalChange,
  element_id,
}: {
  current_value: string;
  setParam: (a: string) => void;
  params?: { i?: Array<string> | string; src?: string };
  notifyGlobalChange?: () => void;
  element_id?: string;
}): JSX.Element => {
  const eva = get_engine() as Eva;

  const [oid_list, setOIDList] = useState<Array<string>>([]);
  const [inputValue, setInputValue] = useState(current_value || "");

  useEffect(() => {
    setInputValue(current_value);
  }, [current_value]);

  useEffect(() => {
    if (eva?.server_info?.acl?.admin) {
      eva
        .call("bus::eva.core::item.list", { i: params?.i, src: params?.src })
        .then((items) => {
          setOIDList(items.map((item: any) => item.oid));
        });
    }
  }, [params]);

  const handleSaveValue = (value: string) => {
    const newValue = value || "";
    setParam(newValue);
    if (notifyGlobalChange) {
      notifyGlobalChange();
    }
  };

  if (eva?.server_info?.acl?.admin) {
    return (
      <ThemeProvider theme={THEME}>
        <Autocomplete
          key={element_id}
          fullWidth
          freeSolo
          options={oid_list}
          disableClearable
          value={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
          }}
          onChange={(_, val) => {
            const newValue = val || "";
            setInputValue(newValue);
            handleSaveValue(newValue);
          }}
          onBlur={() => {
            handleSaveValue(inputValue.trim() || "");
          }}
          onFocus={() => {
            handleSaveValue(inputValue.trim() || "");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSaveValue(inputValue.trim() || "");
              (e.target as HTMLInputElement).blur();
            }
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
          key={element_id}
          fullWidth
          type="text"
          // size={params?.size}
          value={inputValue}
          onChange={(e) => {
            const { value } = e.target;
            setInputValue(value || "");
          }}
          onBlur={() => {
            handleSaveValue(inputValue.trim() || "");
          }}
          onFocus={() => {
            handleSaveValue(inputValue.trim() || "");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSaveValue(inputValue.trim() || "");
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </>
    );
  }
};
