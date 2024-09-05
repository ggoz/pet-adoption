const TxInfo = ({ message }) => {
  return (
    <div className='message-warning'>
      <div>Waiting for: {message}</div>
    </div>
  );
};

export default TxInfo;
