import { i18n } from "../../i18n";

const Spinner = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "80vh" }}
    >
      <div
        className="spinner-border"
        style={{ width: "120px", height: "120px" }}
        role="status"
      >
        <span className="visually-hidden">{i18n.spinner.loading}</span>
      </div>
    </div>
  );
};

export default Spinner;
