import './App.css';
import React, { Component } from 'react';
import Contacts from './components/Contacts';
import axios from 'axios';
import AddContactForm from './components/AddContactForm';

class App extends Component {

  state = {
    message:'',
    recepients:{},
    currentContact:{}
  }
  //recepients above is a collection of objects. 
    //A javascript object has been used instead of a javascript array
    //For the purpose of accesing inner objects with a key

  backendServiceURL = 'http://localhost:5000'; //to be replaced with the host name
  twilioNumber = '+447883280158'; //taken using a trial account

  // Server-Sent-Event Listener to Receive Updates
  initiateSSEListener = () =>{
    
    const sse = new EventSource(this.backendServiceURL+"/sms/server/events");

    let recepient = {};

    sse.onerror = (error) => {
      //console.log('error in SSE');
      console.log(error);
      sse.close();
    };
    
    sse.onmessage = (payload) => {
      try{
        //receives Object -> example {"update":{"to":"+4474..","messageSid":"SM82...","status":"sent"}}
        const data = JSON.parse(payload.data);
        //clone recepients (map) object from state
        const recepients = {...this.state.recepients};
        //extracts existing recepient (single) with recepient's phone number as key
        recepient = recepients[data.update.to];
        //if(recepient !== undefined)
        if(data.update.status === undefined){
          recepient.response = `Response: ${data.update.messageBody}`;
        }else{
          //update recepient's status with server updates
          recepient.status = data.update.status;
        }
        //puts (single) recepient back in the cloned recepients (map) object
        recepients[data.update.to] = recepient;
        //update state
        this.setState({ recepients });
      }catch(err){
        console.log(err);
      }
    };
  }

  componentDidMount(){
    //console.log('Mounted');
    this.initiateSSEListener(); //called again at handleSendingMessage() as a temporary measure to overcome Antivrus Software issue on the Browser (Sophos Endpoint)
  }

  sendMessages(){
    //console.log(this.getRecepientsArray());
    //creates a payload with state object data
    const payload = {
      "from":this.twilioNumber,
      "message":this.state.message,
      "to": this.getRecepientsArray()
    }
    //invokes backend service (post data)
    axios.post(this.backendServiceURL+'/sms',payload)
    .then(function (response) {
      //can add a temporary state change on labels such as 'sending...'
      //console.log(response);
    })
    .catch(function (error) {
      //console.log(error);
    });
  }
  //utility function to extract essential recepients data in an array (to -> backend)
  getRecepientsArray(){
    let recepientsArray = [];
    const {recepients} = this.state;
    recepientsArray = Object.keys(recepients).map((key, index) => {
      let recepient = recepients[key];
      //recepientsArray.push({"number":recepient.number, "name":recepient.name});
      return {"number":recepient.number, "name":recepient.name};
    });
    //console.log(recepientsArray);
    return recepientsArray;
  }

  
// Static Elements EventHandlers
  // Textarea - Text Change Handler
  handleMessageChange = e =>{
    let message = e.target.value;
    //update state
    this.setState({ message });
  }
  // Button - Click Handler
  handleSendingMessage(){
    this.sendMessages();
    this.initiateSSEListener();//Temporary measure to overcome Antivrus Software issue on the Browser (Sophos Endpoint) 
  }

  // AddContactForm Component - EVENT HANDLERS
  // AddContactForm Component -> Input (Telephone) - Text Change Handler
  handleNumberChange = e =>{
    let number = e.target.value;
    //update state
    let currentContact = {...this.state.currentContact};
    currentContact.number = number;
    //update state
    this.setState({ currentContact });
  }
  // AddContactForm Component -> Input (Text) - Text Change Handler
  handleNameChange = e =>{
    let name = e.target.value;
    //clone currentContact from state
    let currentContact = {...this.state.currentContact};
    currentContact.name = name;
    //update state
    this.setState({ currentContact });
  }
  // AddContactForm Component -> Button - Click Handler
  handleAddRecepient = () => {
    //clone currentContact from state
    const currentContact = {...this.state.currentContact};
    if(currentContact.name === undefined || currentContact.number === undefined){
      console.log('empty')
      return;
    }
    //clone recepients object from state
    const recepients = {...this.state.recepients};
    //update status property of currentContact
    currentContact.status = 'added';
    //add key with phone-number, add value with currentContact Object 
    recepients[currentContact.number] = currentContact;
    //update state
    this.setState({ recepients });
  }
  
  // Contact Component - EVENT HANDLERS
  // Contact Component -> Input (Text) - Text Change Handler
  handleModifyRecepient = (recepient, e) => {
    //create new recepient with current recepient number + text-input value as name + new status
    const newRecepient = {number: recepient.number, name: e.target.value, status: 'Modified'};
    //clone recepients object from state
    const recepients = {...this.state.recepients};
    //set new recepient with phone number as key
    recepients[recepient.number] = newRecepient;
    //update state
    this.setState({ recepients });
  }
  //  Contact Component -> Button - Click Handler
  handleDeleteRecepient = (recepient) => {
    //clone recepients from state
    const recepients = {...this.state.recepients};
    //delete current recepient by key/phone-number
    delete recepients[recepient.number];
    //update state
    this.setState({ recepients });
  };

  render() { 
    return ( 
      <div>
        <div className="sms-area">
          <h2>Message</h2>
          <textarea value={this.state.message} id="message" onChange={ e => this.handleMessageChange(e)} className="form-control"></textarea>
          <button onClick={() => this.handleSendingMessage()} className="btn btn-primary">Send</button>
        </div>
        <table className="table table-striped">
          <AddContactForm 
            currentContact={this.state.currentContact} 
            onPhoneNumberChange={this.handleNumberChange} 
            onNameChange={this.handleNameChange}
            onAddRecepient={this.handleAddRecepient}/>
          <Contacts 
            recepients={this.state.recepients} 
            onModifyRecepient={this.handleModifyRecepient} 
            onDeleteRecepient={this.handleDeleteRecepient}/>
        </table>
      </div>
     );
  }
}
 
export default App;

