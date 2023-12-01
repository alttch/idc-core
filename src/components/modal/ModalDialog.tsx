import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { ModalDialogProps } from "../../types";
import CustomButton from "../buttons/custom_button.tsx";

const ModalDialog = ({
  open,
  onClose,
  title,
  onClick,
  onCancel,
  confirmText,
  cancelText,
  children,
}: ModalDialogProps) => {


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onClick(); 
    }
  };


  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
         onKeyUp={handleKeyDown} 
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {children}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            gap: "20px",
          }}
        >
          <CustomButton
            className="idc-btn idc-btn-outlined-no-icon "
            onClick={() => {
              onClick();
              onClose();
            }}
          >
            {confirmText || "YES"}
          </CustomButton>
          <CustomButton
            className="idc-btn idc-btn-outlined-no-icon"
            onClick={onCancel || onClose}
          >
            {" "}
            {cancelText || "NO"}
          </CustomButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ModalDialog;
