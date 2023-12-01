import { get_engine } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { THEME } from "../common";
import { Autocomplete, TextField, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";

export const EditSelectServerOID = ({
  current_value = "",
  setParam,
  params
}: {
  current_value: string;
  setParam: (a: string) => void;
  params?: { i?: Array<string> | string, src?: string  };
}): JSX.Element => {
  const eva = get_engine() as Eva;

  const [oid_list, setOIDList] = useState<Array<string>>([]);

  useEffect(() => {
    if (eva?.server_info?.acl?.admin) {
      eva
        .call("bus::eva.core::item.list", { i: params?.i, src: params?.src })
        .then((items) => {
          setOIDList(items.map((item: any) => item.oid));
        });
    }
  }, [params]);

  if (eva?.server_info?.acl?.admin) {
    return (
      <ThemeProvider theme={THEME}>
        <Autocomplete
          fullWidth
          freeSolo
          options={oid_list}
          disableClearable
          value={current_value || ""}
          onChange={(_, val) => {
            setParam(val);
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
  } else {
    return (
      <>
        <TextField
          fullWidth
          type="text"
          value={current_value}
          // size={params?.size}
          onChange={(e) => {
            setParam(e.target.value);
          }}
        />
      </>
    );
  }
};
