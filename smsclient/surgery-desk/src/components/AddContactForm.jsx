import React from "react";

const AddContactForm = (props) => {
  return (
    <thead>
      <tr>
        <th>Status</th>
        <th>Phone Number</th>
        <th>Recepient's Name</th>
      </tr>
      <tr>
        <th>
          <div style={{ width: "80px" }}>⇣</div>
        </th>
        <td>
          <input
            id="phone"
            type="tel"
            value={props.number}
            onChange={(e) => props.onPhoneNumberChange(e)}
            className="form-control"
            placeholder="Phone Number"
          />
        </td>
        <td>
          <input
            value={props.name}
            id="recepientName"
            onChange={(e) => props.onNameChange(e)}
            className="form-control"
            placeholder="Recepient's Name"
          />
        </td>
        <td>
          <button
            onClick={() => props.onAddRecepient()}
            className="btn btn-primary"
          >
            Add ⇣
          </button>
        </td>
      </tr>
    </thead>
  );
};

export default AddContactForm;
