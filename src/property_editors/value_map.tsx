import React, { useEffect, useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField
} from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { MuiColorInput } from "mui-color-input";
import CustomButton from "../components/buttons/custom_button.tsx";

export interface ValueMap {
  label: string;
  value?: string;
  color: string;
}

export const EditValueMap = ({
  element_id,
  current_value,
  setParam,
  params
}: {
  element_id: string;
  current_value?: Array<ValueMap>;
  setParam: (a: any) => void;
  params?: any;
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="idc-string-editor-wrapper">
      <IconButton onClick={toggleModal}>
        <MoreHorizIcon />
      </IconButton>
      {isOpen && (
        <ValueMapEditor
          element_id={element_id}
          current_value={current_value}
          isOpen={isOpen}
          toggleModal={toggleModal}
          setParam={setParam}
          params={params}
        />
      )}
    </div>
  );
};

export const ValueMapEditor = ({
  element_id,
  current_value,
  isOpen = false,
  toggleModal,
  setParam,
  params
}: {
  element_id: string;
  current_value?: Array<ValueMap>;
  isOpen: boolean;
  toggleModal: () => void;
  setParam: (a: any) => void;
  params?: any;
}) => {
  const [value_map, setVAlueMaps] = useState<Array<ValueMap>>(
    current_value === undefined ? [] : JSON.parse(JSON.stringify(current_value))
  );

  useEffect(() => {
    setVAlueMaps(
      current_value === undefined
        ? []
        : JSON.parse(JSON.stringify(current_value))
    );
  }, [element_id]);

  const closeDialog = () => {
    toggleModal();
  };

  const addValues = () => {
    setVAlueMaps([...value_map, { label: "", color: "" }]);
  };

  const removeValues = (index: number) => {
    const newArrayOfValues = [...value_map];
    newArrayOfValues.splice(index, 1);
    setVAlueMaps(newArrayOfValues);
  };

  const handleLabelsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const newArrayOfLabels = [...value_map];
    newArrayOfLabels[index].label = e.target.value;
    setVAlueMaps(newArrayOfLabels);
  };

  const handleValuesChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const newArrayOfValues = [...value_map];
    newArrayOfValues[index].value = e.target.value;
    setVAlueMaps(newArrayOfValues);
  };

  const handleColorChange = (color: string, index: number) => {
    const newArrayOfColors = [...value_map];
    newArrayOfColors[index].color = color;
    setVAlueMaps(newArrayOfColors);
  };

  const submitStringsValues = () => {
    setParam(value_map);
    closeDialog();
  };

  return (
    <div>
      <Dialog open={isOpen} onClose={closeDialog}>
        <DialogTitle>{params?.title}</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: "10px" }}>{params.help}</div>
          {value_map.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px"
              }}
            >
              <TextField
                label=""
                type="string"
                variant="outlined"
                value={item.value || ""}
                onChange={(e) => handleValuesChange(e, index)}
              />
              <TextField
                label=""
                variant="outlined"
                type="text"
                value={item.label || ""}
                onChange={(e) => handleLabelsChange(e, index)}
              />
              <MuiColorInput
                format="hex8"
                label=""
                placeholder="Color"
                value={item.color || ""}
                onChange={(color) => handleColorChange(color, index)}
              />
              <IconButton color="secondary" onClick={() => removeValues(index)}>
                <RemoveCircleIcon sx={{ color: "#18212B" }} />
              </IconButton>
            </Box>
          ))}
          <CustomButton
            className="idc-btn idc-btn-outlined-no-icon"
            onClick={addValues}
          >
            Add values
          </CustomButton>
        </DialogContent>
        <DialogActions>
          <CustomButton
            className="idc-btn idc-btn-outlined-no-icon"
            onClick={submitStringsValues}
          >
            Apply
          </CustomButton>
          <CustomButton
            className="idc-btn idc-btn-outlined-no-icon"
            onClick={closeDialog}
          >
            Cancel
          </CustomButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};
