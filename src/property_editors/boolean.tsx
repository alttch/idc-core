import Checkbox from "@mui/material/Checkbox";

export const EditBoolean = ({
  current_value,
  setParam,
}: {
  current_value: boolean;
  setParam: (a: boolean) => void;
}): JSX.Element => {
  return (
    <>
      <Checkbox
        className="idc-editor-checkbox"
        checked={current_value}
        onChange={(e) => {
          setParam(e.target.checked);
        }}
      />
    </>
  );
};
