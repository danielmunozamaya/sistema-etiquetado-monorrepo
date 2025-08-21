import { useEffect, useState } from "react";
import useToastStore from "./store/ToastMessage.store";
import "./ToastMessage.css";

const ToastMessage: React.FC = () => {
  const { isVisible, message, type, duration, hideToast } = useToastStore();
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (isVisible) setKey((prev) => prev + 1);
  }, [isVisible, message]);

  if (!isVisible) return null;

  return (
    <div
      key={key}
      className={`custom-toast ${type} show`}
      role="alert"
      style={{ animationDuration: `${duration}ms` }}
    >
      <button className="custom-toast-close" onClick={hideToast}>
        ×
      </button>
      <div className="custom-toast-body">{message}</div>
      <div
        className="custom-toast-progress"
        style={{ animationDuration: `${duration}ms` }}
      ></div>
    </div>
  );
};

export default ToastMessage;