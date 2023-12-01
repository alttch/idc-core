import { Box, Slider } from "@mui/material";

export interface NumberSliderParams {
  label?: string;
  min: number;
  max: number;
  step?: number;
}

export const EditNumberSlider = ({
  current_value,
  setParam,
  params
}: {
  current_value: number;
  setParam: (value: number) => void;
  params: NumberSliderParams;
}) => {
  const handleChange = (_event: Event, newValue: number | number[]) => {
    setParam(Math.round(newValue as number));
  };

  return (
    <Box sx={{ width: 100, marginLeft: "10px" }}>
      <Slider
        sx={{ color: "#464646" }}
        aria-label={params.label}
        value={current_value}
        onChange={handleChange}
        step={params.step || 1}
        min={params.min}
        max={params.max}
        valueLabelDisplay="auto"
      />
    </Box>
  );
};
