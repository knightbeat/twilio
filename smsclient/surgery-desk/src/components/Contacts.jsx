import Contact from "./Contact";
/*
const Contacts = (props) => {
  const contactsList = props.recepients.map((contact, index) => {
    return (
      <Contact
        key={index}
        contact={contact}
        onDelete={props.handleDeleteContact}
        onModify={props.handleModifyContact}
      ></Contact>
    );
  });
  return <div>{contactsList}</div>;
};
*/
const Contacts = (props) => {
  const contactsList = Object.keys(props.recepients).map((key, index) => {
    return (
      <Contact
        key={key}
        recepient={props.recepients[key]}
        onDeleteMe={props.onDeleteRecepient}
        onModifyMe={props.onModifyRecepient}
      ></Contact>
    );
  });
  return <tbody>{contactsList}</tbody>;
};

export default Contacts;
