import { useState } from 'react'
import { parseEther } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import axios from 'axios';
import "./Create.css";

const pinataApiKey= "65088f1651b711bb0e8c";
const pinataSecretApiKey= "7ca2d75261b5aaecb57fd8dab2e550eccc5fafbc81e76d980d9e6a74244521f0";

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
          maxContentLength: 'Infinity', // Required to handle large files
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretApiKey,
          },
        });
  
        setImage(`https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
      } catch (error) {
        console.error("Error while uploading image to Pinata", error);
      }
    }
  }
  const createNFT = async () => {
    if (!image || !price || !name || !description) return

    const data = {
      "name": name,
      "description": description,
      "image": image
    };

    // Convert data to JSON format
    const jsonData = JSON.stringify(data);
  
    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    try{
      const formData = new FormData();
      formData.append('file', blob, 'metadata.json');

      const result = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        maxContentLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretApiKey,
        },
      });
  
      mintThenList(result)
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }
  const mintThenList = async (result) => {
    const uri = `https://gateway.pinata.cloud/ipfs/${result.data.IpfsHash}`;
    // mint nft 
    await(await nft.mint(uri)).wait()
    // get tokenId of new nft 
    const id = await nft.tokenCount()
    // approve marketplace to spend nft
    await(await nft.setApprovalForAll(marketplace, true)).wait()
    // add nft to marketplace
    const listingPrice = parseEther(price.toString())
    await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
  }
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create