import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export const EditSelectString = ({
  current_value,
  setParam,
  params,
}: {
  current_value: string;
  setParam: (a: any) => void;
  params?: string[];
}) => {
  return (
    <>
      <Select
        className="idc-editor-select"
        value={current_value}
        onChange={(e) => {
          setParam(e.target.value);
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
