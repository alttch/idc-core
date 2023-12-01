import { MuiColorInput } from "mui-color-input";

export const EditSelectColor = ({
  current_value,
  setParam,
}: {
  current_value: string;
  setParam: (a: any) => void;
}): JSX.Element => {
  return (
    <>
      <MuiColorInput format="hex8" value={current_value} onChange={setParam} />
    </>
  );
};
