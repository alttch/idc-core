const ErrorBar = ({ message }: { message: string | null }) => {
  return <div className="idc-editor-sidebar-error">{message}</div>;
};

export default ErrorBar;
