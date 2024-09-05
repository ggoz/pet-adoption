import { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import PetItem from "./components/PetItem";
import TxError from "./components/TxError";
import WalletNotDetected from "./components/WalletNotDetected";
import ConnectWallet from "./components/ConnectWallet";

import { ethers } from "ethers";
import { contractAddress } from "./address";
import PetAdoptionArtifact from "./contracts/PetAdoption.json";
import TxInfo from "./components/TxInfo";

const HARDHAT_NETWORK_ID = Number(process.env.REACT_APP_NETWORK_ID);

function Dapp() {
  const [pets, setPets] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [txError, setTxError] = useState(undefined);
  const [txInfo, setTxInfo] = useState(undefined);
  const [view, setView] = useState("home");
  const [ownedPets, setOwnPets] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:8080/pets");
      const data = await res.json();
      console.log(data);
      setPets(data);
    })();
  }, []);

  // 连接钱包
  const connectWallet = async () => {
    try {
      const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });
      await checkNetwork();
      initializeDapp(address);
      window.ethereum.on("accountsChanged", ([newAddress]) => {
        if (newAddress === undefined) {
          setOwnPets([]);
          setView("home");
          setTxInfo(undefined);
          setTxError(undefined);
          setAdoptedPets([]);
          setContract(undefined);
          setSelectedAddress(undefined);
          return;
        }
        initializeDapp(newAddress);
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 初始化Dapp
  const initializeDapp = async (address) => {
    setSelectedAddress(address);
    const contract = await initContract();

    // 获取所有被领养的宠物
    await getAdoptedPets(contract);
  };

  // 初始化合约
  const initContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress.PetAdoption, PetAdoptionArtifact.abi, signer);
    setContract(contract);
    return contract;
  };

  // 获取所有被领养的宠物
  const getAdoptedPets = async (contract) => {
    try {
      const adoptedPets = await contract.getAllAdoptedPets();
      const ownedPets = await contract.getAllAdoptedPetsByOwner();
      if (adoptedPets.length > 0) {
        setAdoptedPets(adoptedPets.map((petId) => Number(petId)));
        // setAdoptedPets(adoptedPets);
      } else {
        setAdoptedPets([]);
      }

      if (ownedPets.length > 0) {
        setOwnPets(ownedPets.map((petId) => Number(petId)));
      } else {
        setOwnPets([]);
      }
    } catch (e) {
      setTxError(e?.reason);
      console.error(e);
    }
  };

  // 领养宠物
  const adoptPet = async (id) => {
    try {
      const tx = await contract.adoptPet(id);
      setTxInfo(tx.hash);
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      setAdoptedPets([...adoptedPets, id]);
      setOwnPets([...ownedPets, id]);
    } catch (e) {
      setTxError(e?.reason);
      console.error(e);
    } finally {
      setTxInfo(undefined);
    }
  };

  // 切换网络
  const switchNetwork = async () => {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`;

    return await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
  };

  // 检查网路
  const checkNetwork = async () => {
    const netVersion = await window.ethereum.request({ method: "net_version" });

    if (netVersion !== HARDHAT_NETWORK_ID.toString()) {
      return switchNetwork();
    }
    return null;
  };

  if (!window.ethereum) {
    return <WalletNotDetected></WalletNotDetected>;
  }

  if (!selectedAddress) {
    return <ConnectWallet connect={connectWallet}></ConnectWallet>;
  }
  return (
    <div className='container'>
      {txInfo && <TxInfo message={txInfo}></TxInfo>}
      {txError && <TxError message={txError} dismiss={() => setTxError(undefined)}></TxError>}

      <br />
      <NavBar setView={setView} address={selectedAddress}></NavBar>
      <div className='items'>
        {view === "home"
          ? pets.map((pet) => (
              <PetItem
                key={pet.id}
                pet={pet}
                inProgress={!!txInfo}
                disabled={adoptedPets.includes(pet.id)}
                adoptPet={() => adoptPet(pet.id)}></PetItem>
            ))
          : pets
              .filter((pet) => ownedPets.includes(pet.id))
              .map((pet) => <PetItem key={pet.id} pet={pet} disabled={true} adoptPet={() => {}}></PetItem>)}
      </div>
    </div>
  );
}

export default Dapp;
