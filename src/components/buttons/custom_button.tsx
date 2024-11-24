import { CustomButtonProps } from "../../types";

const CustomButton = ({
  className,
  type = "button",
  children,
  onClick,
  disabled,
  title,
}: CustomButtonProps) => {
  return (
    <button
      title={title}
      disabled={disabled}
      className={className}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CustomButton;
