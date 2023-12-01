import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { parseNumber } from "bmat/numbers";

export const EditSelectNumber = ({
  current_value,
  setParam,
  params
}: {
  current_value: number;
  setParam: (a: any) => void;
  params?: number[];
}): JSX.Element => {
  return (
    <>
      <Select
        className="idc-editor-select"
        value={current_value.toString()}
        onChange={(e) => {
          setParam(parseNumber(e.target.value, { float: true }));
        }}
      >
        {params?.map((v) => (
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};
