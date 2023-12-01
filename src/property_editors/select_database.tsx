import { get_engine } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useEffect, useState, useCallback } from "react";

interface DbInfo {
  id: string;
  default: boolean;
}

export const EditSelectDatabase = ({
  current_value = "",
  setParam
}: {
  current_value: string;
  setParam: (a: string) => void;
  params?: { size?: number };
}): JSX.Element => {
  const eva = get_engine() as Eva;

  const [db_list, setDbList] = useState<Array<DbInfo>>([
    { id: "default", default: true }
  ]);

  useEffect(() => {
    eva
      .call("db.list")
      .then((dbs) => setDbList(dbs))
      .catch((e) => {
        eva.log.warning(`unable to get db list: ${e.message}`);
      });
  }, []);

  const getDefaultDb = useCallback((): string => {
    for (const db of db_list) {
      if (db.default) {
        return db.id;
      }
    }
    return "";
  }, [db_list]);

  return (
    <>
      <Select
        className="idc-editor-select"
        value={current_value || getDefaultDb()}
        onChange={(e) => {
          setParam(e.target.value || "");
        }}
      >
        {db_list?.map((v) => (
          <MenuItem key={v.id} value={v.id}>
            {v.id}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};
