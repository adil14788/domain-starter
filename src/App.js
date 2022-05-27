import React, { useEffect, useState } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import { ethers } from "ethers";
import ContractAbi from "./utils/Domain.json";
// Constants
const TWITTER_HANDLE = "AdilIrshad73";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = ".marvel";
const address = "0xD4C894F9eA3B31b4D0FB615edA1586e0862518E0";

const App = () => {
	const [currentAccount, setCurrentAccount] = useState("");
	const [domain, setDomain] = useState("");
	const [record, setRecord] = useState("");

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;
		if (!ethereum) {
			console.log("Please install metamask");
		} else {
			console.log("MetaMask is connected ", ethereum);
		}

		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found");
		}
	};

	const connectWallet = async () => {
		const { ethereum } = window;

		const accounts = await ethereum.request({ method: "eth_requestAccounts" });
		console.log("Connected Account", accounts[0]);
		setCurrentAccount(accounts[0]);
	};

	const mintDomain = async () => {
		if (!domain) {
			alert("Domain cannot be empty");
			return;
		}

		if (domain.length < 3) {
			alert("Domain name must be atleast 3 character");
		}

		const price =
			domain.length === 3 ? "0.5" : domain.length === 4 ? "0.3" : "0.1";
		console.log("Minting domain", domain, "with price", price);

		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(address, ContractAbi.abi, signer);
				console.log("Going to pop wallet for gas fees");

				let txn = await contract.register(domain, {
					value: ethers.utils.parseEther(price),
				});
				const receipt = await txn.wait();
				if (receipt === 1) {
					console.log(
						"Domain minted! https://mumbai.polygonscan.com/tx/" + txn.hash
					);
					txn = await contract.setRecord(domain, record);
					await txn.wait();
					console.log(
						"Record set! https://mumbai.polygonscan.com/tx/" + txn.hash
					);

					setRecord("");
					setDomain("");
				} else {
					alert("Transaction cancelled!Please try again later");
				}
			}
		} catch (err) {
			console.log(err);
		}
	};

	const renderInputForm = () => {
		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder="domain"
						onChange={(e) => setDomain(e.target.value)}
					/>
					<p className="tld"> {tld} </p>
				</div>
				<input
					type="text"
					value={record}
					placeholder="What is your Marvel Power"
					onChange={(e) => setRecord(e.target.value)}
				/>

				<div className="button-container">
					<button
						className="cta-button mint-button"
						disabled={null}
						onClick={mintDomain}
					>
						Mint
					</button>
					<button
						className="cta-button mint-button"
						disabled={null}
						onClick={null}
					>
						Set data
					</button>
				</div>
			</div>
		);
	};

	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<img
				src="https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif"
				alt="Ninja gif"
			/>
			<button
				className="cta-button connect-wallet-button"
				onClick={connectWallet}
			>
				Connect Wallet
			</button>
		</div>
	);

	useEffect(() => {
		checkIfWalletIsConnected();
	}, [currentAccount]);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<header>
						<div className="left">
							<p className="title">🐱‍👤 Marvel Name Service</p>
							<p className="subtitle">Your immortal API on the blockchain!</p>
						</div>
					</header>
				</div>
				{!currentAccount && renderNotConnectedContainer()}
				{currentAccount && renderInputForm()}
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
