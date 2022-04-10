const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const Web3 = require("web3")
const web3 = new Web3()


fs = require('fs')
const { Readable } = require('stream')
const { CID } = require('multiformats/cid')
const Block = require('multiformats/block')

const { sha256 } = require('multiformats/hashes/sha2')
const dagCBOR = require('@ipld/dag-cbor')


// CAR utilities, see https://github.com/ipld/js-car for more info
const { CarWriter } = require( '@ipld/car/writer')
const { CarReader } = require( '@ipld/car/reader')


const utf8Encoder = new TextEncoder()
const utf8Decoder = new TextDecoder()

async function upload_data(value){
	const payload = await Block.encode({
		value: value,
		hasher: sha256,
		codec: dagCBOR
	})

	const { writer, out } = await CarWriter.create([payload.cid])
	Readable.from(out).pipe(fs.createWriteStream('ipld-local.car'))

	writer.put(payload)

	await writer.close()

	return payload.cid
}

async function read_data(cid){
	if (cid === "") {
		return {out_edges: []}
	}
	const inStream = fs.createReadStream('ipld-local.car')
	const reader = await CarReader.fromIterable(inStream)
	if (typeof cid === 'string'){
		cid = CID.parse(cid)
	}
	const recovered_payload = await reader.get(cid)
	await inStream.close()

	return dagCBOR.decode(recovered_payload.bytes)
}

upload_data({
	out_edges: []
}).then((cid) => read_data(cid))

function local_deploy() {
	const dao =  ethers.getContractFactory("PeerReviewDAO").then((Rep) =>  Rep.deploy(0))

	const accounts = ethers.getSigners();

	return {"rep": dao, "acc": accounts}
}



const express = require('express')
const app = express()
app.use(express.json())


let obj = local_deploy()
let dao = obj.rep
let eth_accounts = obj.acc


app.get('/accounts', (req, res) => {
	eth_accounts.then((accounts) => res.send(accounts.slice(10).map((v,idx) => Object({ref_id: idx, address: v.address}))))
})

app.get('/dao-participants', async (req, res) => {
	const accounts = await eth_accounts
	const contract = await dao
    const list = await contract.getReviewers()
    res.send(list)
})

app.post('/vote', async (req, res) => {
	const accounts = await eth_accounts
	const contract = await dao

    const purposalID = req.body.p_id
    const vote = req.body.vote
    
	const tx = await contract.connect(accounts[req.body.ref_id]).voteOnProposal(purposalID, parseInt(vote))
	await tx
    res.send(200)
})

// Create a purposal
app.post('/purposal', async (req, res) => {
	const accounts = await eth_accounts
	const contract = await dao
    const purposalText = req.body.paper
    
    const cid = await upload_data(purposalText)
    const purposeTx = await contract.proposePaper(cid.toString())

    await purposeTx
    
	// const newCID = await update_trusted_list(accounts[req.body.ref_id], accounts[req.body.account_to_add])
	// const newPayload = await read_data(newCID)
	res.send(Object({
		purposal: purposalText,
        // pid: parseInt(purposeTx3.value.hex, 16)
        // pid: purposeTx3.value.toHexString()
        cid: cid.toString(),
        transaction: purposeTx
	}))
})


// Create a purposal
app.post('/publish', async (req, res) => {
	const accounts = await eth_accounts
	const contract = await dao
    
    const tx = contract.publishProposal(req.body.p_id)
    await tx

    res.send(200)
    
})
// Read purposal by providing the CID
app.get('/view-paper/:cid', async (req, res) => {
	const cid = req.params.cid
	const data = await read_data(cid);
    res.send(data);
})

app.post('/join', async (req, res) => {
    const contract = await dao
    const accounts = await eth_accounts

    const tx = await contract.connect(accounts[req.body.ref_id]).joinDAO()
    await tx
    res.send(200)
})

app.get('/accounts', (req, res) => {
	eth_accounts.then(
		(accounts) => res.send(accounts[0].address)
	)
})


app.get('/view-publication', async (req, res) => {
    const contract = await dao
    const accounts = await eth_accounts

    const papers = await contract.getAcceptedPapers()
    console.log("PAPPERS")
    console.log(papers)
    
    res.send(papers.map(cid => "http://localhost:3000/view-paper/".concat(cid)))
})

app.listen(3000)
console.log("Server Started at Localhost:3000")
upload_data({out_edges: []}).then((cid) => console.log(
	"COMPLETED UPLOAD %s", cid.toString()
))