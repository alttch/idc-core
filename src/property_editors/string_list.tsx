import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CustomButton from "../components/buttons/custom_button.tsx";

export interface EditStringListSetValueButton {
  value: string;
  onClick: () => Array<string>;
}

export const EditStringList = ({
  element_id,
  current_value,
  setParam,
  params
}: {
  element_id: string;
  current_value?: Array<string>;
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
        <ArrayStringsEditor
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

const ArrayStringsEditor = ({
  element_id,
  current_value,
  isOpen,
  toggleModal,
  setParam,
  params
}: {
  element_id: string;
  current_value?: Array<string>;
  isOpen: boolean;
  toggleModal: () => void;
  setParam: (a: any) => void;
  params?: any;
}) => {
  const [inputs, setInputs] = useState(
    current_value === undefined ? [] : current_value
  );

  useEffect(() => {
    setInputs(current_value === undefined ? [] : current_value);
  }, [element_id]);

  const closeDialog = () => {
    toggleModal();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const newInputs = [...inputs];
    newInputs[index] = e.target.value;
    setInputs(newInputs);
  };

  const addInput = () => {
    setInputs([...inputs, ""]);
  };

  const removeInput = (index: number) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };

  const submitStringsValues = () => {
    const filtered = inputs.filter((str) => str !== "");
    setInputs(filtered);
    setParam(filtered);
    closeDialog();
  };

  let extra_buttons;

  if (Array.isArray(params?.extra_buttons)) {
    extra_buttons = (
      params.extra_buttons as Array<EditStringListSetValueButton>
    ).map((v) => {
      const key = `edit-string-list-xbtn-{v.value}`;
      const onClick = () => {
        setInputs(v.onClick());
      };
      return (
        <CustomButton
          className="idc-btn idc-btn-outlined-no-icon"
          key={key}
          onClick={onClick}
        >
          {v.value}
        </CustomButton>
      );
    });
  }

  return (
    <div>
      <Dialog open={isOpen} onClose={closeDialog}>
        <DialogTitle>{params?.title}</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: "15px" }}>{params?.help}</div>
          {inputs.map((input, index) => (
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
                variant="outlined"
                fullWidth
                value={input}
                onChange={(e) => handleInputChange(e, index)}
              />
              <IconButton color="secondary" onClick={() => removeInput(index)}>
                <RemoveCircleOutlineIcon sx={{ color: "#18212B" }} />
              </IconButton>
            </Box>
          ))}
          <CustomButton
            className="idc-btn idc-btn-outlined-no-icon"
            onClick={addInput}
          >
            Add
          </CustomButton>
        </DialogContent>
        <DialogActions>
          <CustomButton
            className="idc-btn idc-btn-outlined-no-icon"
            onClick={submitStringsValues}
          >
            Apply
          </CustomButton>
          {extra_buttons}
          <CustomButton
            className="idc-btn idc-btn-outlined-no-icon"
            onClick={closeDialog}
          >
            Cancel
          </CustomButton>
          <CustomButton
            className="idc-btn idc-btn-outlined-no-icon clear"
            onClick={() => setInputs([])}
          >
            Clear
          </CustomButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};
