import { TextField } from "@mui/material";

export const EditString = ({
  current_value = "",
  setParam,
}: {
  current_value: string;
  setParam: (a: string) => void;
  params?: { size?: number };
}): JSX.Element => {
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
};
