import React from "react";

const TxError = ({ message, dismiss }) => {
  return (
    <div className='message-warning' role='alert'>
      <div>Error sending transaction: {message}</div>
      <br />
      <button onClick={dismiss} type='button dismiss-button' className='close'>
        <div>Dismiss</div>
      </button>
    </div>
  );
};

export default TxError;
