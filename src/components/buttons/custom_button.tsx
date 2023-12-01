import { CustomButtonProps } from "../../types";

const CustomButton = ({
  className,
  type = "button",
  children,
  onClick,
}: CustomButtonProps) => {
  return (
    <button className={className} type={type} onClick={onClick}>
      {children}
    </button>
  );
};

export default CustomButton;
