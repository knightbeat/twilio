import React from "react";

const Contact = (props) => {
  let statusClass = "bg-info";
  let { status } = props.recepient;

  if (status === "Modified") {
    statusClass = "bg-warning";
  } else if (status === "sent") {
    statusClass = "bg-primary";
  } else if (status === "delivered") {
    statusClass = "bg-success";
  } else if (status === "failed") {
    statusClass = "bg-danger";
  } else {
    statusClass = "bg-info";
  }
  statusClass = statusClass + " status";
  return (
    <React.Fragment>
      <tr>
        <td>
          <p className={statusClass}>{status}</p>
        </td>
        <td style={{ textAlign: "center" }}>
          <span>{props.recepient.number}</span>
        </td>
        <td>
          <input
            id={props.recepient.number}
            value={props.recepient.name}
            onChange={(e) => props.onModifyMe(props.recepient, e)}
            className="form-control"
            style={{ width: "320px" }}
          />
        </td>
        <td>
          <button
            onClick={() => props.onDeleteMe(props.recepient)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </td>
      </tr>
      <tr>
        <td>
          <b></b>
        </td>
        <td colSpan="2">
          <span>{props.recepient.response}</span>
        </td>
      </tr>
    </React.Fragment>
  );
};

export default Contact;
