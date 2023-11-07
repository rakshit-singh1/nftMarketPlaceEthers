import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navigation from './Navbar';
import Home from './Home.js'
import Create from './Create.js'
import MyListedItems from './MyListedItems.js'
import MyPurchases from './MyPurchases.js'

import MarketplaceAbi from '../contractsData/Marketplace.json'
import NFTAbi from '../contractsData/NFT.json'

import { useState } from 'react'
import { ethers, Contract, BrowserProvider } from "ethers"
import { Spinner } from 'react-bootstrap'
import "./App.css"

const NFTAddress = "0x25a7893A6598c4bFCEE5cD6e8Bf539861B346fdF";
const MarketplaceAddress = "0x7A7A55C27230c859f9d61cA1f099d8A1101d9199";

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [marketplace, setMarketplace] = useState({})

  // MetaMask Login/Connect
  const ethersHandler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    const browserProvider = await new BrowserProvider(window.ethereum);

    // Set signer
    const signer = browserProvider.getSigner();

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await ethersHandler()
    })
    loadContracts(signer, browserProvider);
  }

  const loadContracts = async (signer, browserProvider) => {
    try {
      // Get deployed copies of contracts
      const marketplace = new Contract(MarketplaceAddress, MarketplaceAbi, browserProvider);
      const nft = new Contract(NFTAddress, NFTAbi, signer);

      // Set the contract instances and setLoading to false
      setMarketplace(marketplace);
      setNFT(nft);
      setLoading(false);
    } catch (error) {
      // Handle any errors that may occur during contract instantiation
      console.error("Error loading contracts:", error);
    }
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation ethersHandler={ethersHandler} account={account} />
        <div>
          {loading ? (
            <div className="loading-container">
              <Spinner animation="border" className="loading-spinner" />
              <p className='loading-text'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home marketplace={marketplace} nft={nft} />
              } />
              <Route path="/create" element={
                <Create marketplace={marketplace} nft={nft} />
              } />
              <Route path="/my-listed-items" element={
                <MyListedItems marketplace={marketplace} nft={nft} account={account} />
              } />
              <Route path="/my-purchases" element={
                <MyPurchases marketplace={marketplace} nft={nft} account={account} />
              } />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
