import React, { useState, useEffect, useCallback } from "react";
import Portis from '@portis/web3';
import Web3 from 'web3';

//const network = {id: "1", name: "mainnet", address: "0xDdC05b7E9822b4a4AF89ca951c467022afCc0a75"} 
const network = {id: "4", name: "rinkeby", address: "0xe9a09d2d71971F587BC96725f654b9Eee0552c21"}
const portisId = 'f9925b14-b16b-4fdb-bb31-fad887decd67'
const abi = [{"constant":false,"inputs":[],"name":"setDefaultRelayHub","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x1220e2ff"},{"constant":true,"inputs":[],"name":"value","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x3fa4f245"},{"constant":true,"inputs":[],"name":"getHubAddr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x74e861d6"},{"constant":false,"inputs":[{"name":"context","type":"bytes"}],"name":"preRelayedCall","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x80274db7"},{"constant":false,"inputs":[],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x8129fc1c"},{"constant":true,"inputs":[{"name":"relay","type":"address"},{"name":"from","type":"address"},{"name":"encodedFunction","type":"bytes"},{"name":"transactionFee","type":"uint256"},{"name":"gasPrice","type":"uint256"},{"name":"gasLimit","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"approvalData","type":"bytes"},{"name":"maxPossibleCharge","type":"uint256"}],"name":"acceptRelayedCall","outputs":[{"name":"","type":"uint256"},{"name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x83947ea0"},{"constant":true,"inputs":[],"name":"relayHubVersion","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xad61ccd5"},{"constant":false,"inputs":[{"name":"context","type":"bytes"},{"name":"success","type":"bool"},{"name":"actualCharge","type":"uint256"},{"name":"preRetVal","type":"bytes32"}],"name":"postRelayedCall","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xe06e0e22"},{"constant":false,"inputs":[],"name":"increase","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xe8927fbc"},{"anonymous":false,"inputs":[{"indexed":true,"name":"oldRelayHub","type":"address"},{"indexed":true,"name":"newRelayHub","type":"address"}],"name":"RelayHubChanged","type":"event","signature":"0xb9f84b8e65164b14439ae3620df0a4d8786d896996c0282b683f9d8c08f046e8"}]
const gasPrice = "1000"

function App() {

  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [web3, setWeb3] = useState(undefined);
  const [counterInstance, setCounterInstance] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [count, setCount] = useState(0);
  const [txHash, setTxHash] = useState(undefined);

  const connect = () => {
    if(!web3) {
      setConnectionStatus("connecting")
      const portis = new Portis(portisId, network.name, { gasRelay: true });
      const web3 = new Web3(portis.provider);
      setWeb3(web3)
  
      const instance = new web3.eth.Contract(abi, network.address)
      setCounterInstance(instance);
  
      web3.eth.getAccounts((error, accounts) => {
        setAccount(accounts[0])
        setConnectionStatus("connected")
      });
    }
  }

  const getCount = useCallback(async () => {
    if (counterInstance) {
      // Get the value from the contract to prove it worked.
      const response = await counterInstance.methods.value().call();
      // Update state with the result.
      setCount(response);
    }
  }, [counterInstance]);

  useEffect(() => {
    getCount();
  }, [counterInstance, getCount]);

  const increase = () => {
    counterInstance.methods.increase().send({ from: account, gasPrice: web3.utils.toWei(gasPrice, "gwei") })
    .on('transactionHash', function(hash){
        console.log("hash="+hash)
        setTxHash(hash)
    }).on('receipt', function(receipt){
      console.log(receipt)
      setTxHash(undefined)
      getCount();
    });
  };

  return (
    <div>
      <h3> Counter counterInstance ({connectionStatus})</h3>

      {connectionStatus === 'disconnected' && (
        <button onClick={() => connect()} size="small">
          Connect
        </button>
      )}

      {connectionStatus === 'connected' && counterInstance && (
        <React.Fragment>
          <div>Account: {account}</div>
          <div>Count: {count}</div>
          <br /><br />
          {txHash && <div>Hash: {txHash}</div>}
          {!txHash && 
          <button onClick={() => increase()} size="small">
            Increase Counter by 1
          </button>}
            
        </React.Fragment>
      )}
    </div>
  );
}

export default App;