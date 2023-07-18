import { Button, Container, Modal, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { useAccount, useBalance, useConnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { CHAINS, CONTRACTS, EXPLORER_URL, NETWORK_LOGOS, PRICE_FEED, PROJECT_ID, RPC_URL, VALUE_STEPS } from "../constants";
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { enqueueSnackbar } from "notistack";
import Marquee from "react-fast-marquee";
import { Link, useLocation } from "react-router-dom";
import { CommonPageProps } from "../constants/types";
import { ethers } from "ethers";
import abi from "../abi/mixer.json";
import feedAbi from "../abi/feed.json";

export const Header:React.FC<CommonPageProps> = ({toRefresh, setToRefresh}) => {
    const { pathname } = useLocation();
    const { address } = useAccount();
    const [connected, setConnected] = useState(false);
    const [ open, setOpen ] = useState(false);
    const [openDropDwon, setOpenDropDown] = useState(false);
    const { connect: injected } = useConnect({
        connector: new InjectedConnector({
            chains: CHAINS
        }),
    });
    const { data } = useBalance({
        address: address,
    });

    const { connect: walletConnector } = useConnect({
        connector: new WalletConnectConnector({
            chains: CHAINS, 
            options: {
                projectId: PROJECT_ID,
            },
        })
    });

    const doWalletConnect = async () => {
        setOpen(false);
        try{
            await walletConnector();
            localStorage.setItem("connected-wallet", "walletconnect");
            setConnected(true);
        } catch(ex) {
            console.log(ex);
        }
    }

    const doInjected = async () => {
        setOpen(false);
        try{
            await injected();
            localStorage.setItem("connected-wallet", "injected");
            setConnected(true);
        } catch(ex) {
            console.log(ex);
        }
    }

    const disconnectWallet = () => {
        localStorage.removeItem("connected-wallet");
        setConnected(false);
    }

    const copyWalletAddress = () => {
        navigator.clipboard.writeText(address??"");
        enqueueSnackbar(`Address was copied.`, {
            variant: "success"
        });
    }

    useEffect(()=>{
        setConnected(localStorage.getItem("connected-wallet")?true:false);
    },[]);

    const { chain, chains } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();

    useEffect(()=>{
        if(chain && chains.length > 0 && switchNetwork) {
            let supported = false;
            for(let i = 0; i < chains.length; i++) {
                if(chains[i].id === chain.id) {
                    supported = true;
                    break;
                }
            }
            if(!supported) {
                switchNetwork(chains[0]?.id);
            }
            const chainId = chain?chain.id:CHAINS[0].id;
            const provider = new ethers.providers.JsonRpcProvider(RPC_URL[1]);
            const contract = new ethers.Contract(PRICE_FEED[chainId as keyof typeof PRICE_FEED], feedAbi, provider);
            contract.latestAnswer().then((val:string) => {
                setPrice(Number(ethers.utils.formatUnits(val, 8)));
            });
        }
    }, [chain, chains, switchNetwork]);

    const [mixers, setMixers] = useState(0);
    const [balance, setBalance] = useState(0);
    const [mixed, setMixed] = useState(0);
    const [price, setPrice] = useState(0);

    useEffect(()=>{
        const getData = async ()=>{
            const chainId = chain?chain.id:CHAINS[0].id;
            const provider = new ethers.providers.JsonRpcProvider(RPC_URL[chainId as keyof typeof RPC_URL]);
            let totalMixers = 0;
            let totalBalance = 0;
            let totalMixed = 0;
            await Promise.all(VALUE_STEPS.map(async (el)=>{
                const address = CONTRACTS[chainId as keyof typeof CONTRACTS][el as keyof typeof CONTRACTS[5]];
                const contract = new ethers.Contract(address, abi, provider);
                const re = await contract.nextIndex();
                totalMixers += Number(re);
                totalMixed += Number(re)*Number(el);
                const bal = ethers.utils.formatEther(await provider.getBalance(contract.address));
                totalBalance += Number(bal);
            }));
            setMixers(totalMixers);
            setBalance(totalBalance);
            setMixed(totalMixed);
        }
        getData();
    }, [toRefresh, chain]);

    return (
        <>
            <Container className="header" maxWidth={false}>
                <Container maxWidth="lg">
                    <Grid2 container pt={1} pb={0.5}>
                        <Grid2 xs={12} sm={12} lg={6} p={0}>
                            <img alt="logo" width={41} src="logo.png" />
                        </Grid2>                        
                        <Grid2
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            className="horizontal-center menu-bar"
                        >
                            <Link to="/deposit">
                                <div className={`menu-button ${pathname==="/deposit"||pathname==="/"?"menu-button-active":""}`}>
                                    Deposit
                                </div>
                            </Link>
                            <Link to="/withdraw">
                                <div className={`menu-button ${pathname==="/withdraw"?"menu-button-active":""}`}>
                                    Withdraw
                                </div>
                            </Link>
                        </Grid2>
                        <Grid2 p={0} container xs={12} sm={12} lg={6} display="flex" justifyContent="end">
                            {
                                !address || !connected ?
                                <button className="connect-wallet" onClick={() => setOpen(true)}>
                                    Connect Wallet
                                </button>:
                                <Button className="account-button grey-button" variant="contained" endIcon={openDropDwon?<KeyboardArrowUpIcon />:<KeyboardArrowDownIcon />} onClick={()=>setOpenDropDown(!openDropDwon)}>
                                    <img src="/images/account.png" alt="account" width={25} />{address.substring(0,5)}...{address.substr(-4)}
                                    
                                    {openDropDwon && <Grid2 pt={1} className="dropdown-wallet">
                                        <Grid2 className="main-content">
                                            <img src="/images/account.png" alt="account" width={50} />
                                            <Typography mt={1} variant="h6">
                                                {address.substring(0,5)}...{address.substr(-4)}
                                            </Typography>
                                            <Grid2 mt={1} display="flex" justifyContent="center" gap={1}>
                                                <Typography>
                                                    {Number(data?.formatted).toLocaleString(undefined, {maximumFractionDigits: 5})}
                                                </Typography>
                                                <Typography color="#9C9DA6">
                                                    {data?.symbol}
                                                </Typography>
                                            </Grid2>
                                            <Grid2 mt={2} display="flex" flexDirection="column" gap={1}>
                                                <Button variant="contained" className="grey-button action-button" endIcon={<ContentCopyIcon />} onClick={copyWalletAddress}>
                                                    COPY ADDRESS
                                                </Button>
                                                <Button variant="contained" className="grey-button action-button" endIcon={<LogoutIcon />} onClick={disconnectWallet}>
                                                    DISCONNECT
                                                </Button>
                                            </Grid2>  
                                            <Grid2 mt={2} textAlign="center">
                                                <a target="_blank" href={`${EXPLORER_URL}/address/${address}`} className="scan-link">
                                                    View in Etherscan <OpenInNewIcon fontSize="small" />
                                                </a>
                                            </Grid2>                                  
                                        </Grid2>
                                    </Grid2>}
                                </Button>
                            }
                        </Grid2>
                        <Modal
                            open={open}
                            onClose={() => setOpen(false)}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                            className="connect-modal-container"
                            keepMounted={true}
                        >
                            <Grid2 className="connect-modal" py={3} px={4}>
                                <Grid2 display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">
                                        Connect Wallet
                                    </Typography>
                                    <CloseIcon sx={{cursor: "pointer"}} onClick={() => setOpen(false)} />
                                </Grid2>
                                <Grid2 mt={3}>
                                    <Grid2 display="flex" className="wallet-bar" px={2} py={1} justifyContent="space-between" alignItems="center" onClick={doInjected}>
                                        <Typography variant="h6">
                                            METAMASK
                                        </Typography>
                                        <Grid2
                                            p={0.8}
                                            borderRadius={2.5}
                                            sx={{background:"white"}}
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                        >
                                            <img alt="metamask"
                                                width={23}
                                                src="https://img.icons8.com/?size=2x&id=Oi106YG9IoLv&format=png"
                                            />
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 mt={1} display="flex" className="wallet-bar" px={2} py={1} justifyContent="space-between" alignItems="center" onClick={doInjected}>
                                        <Typography variant="h6">
                                            COINBASE WALLET
                                        </Typography>
                                        <Grid2
                                            borderRadius={2.5}
                                            ml={10}
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            overflow="hidden"
                                        >
                                            <img alt="metamask"
                                                width={36}
                                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0XOXRDhs_lCQ-Ma-YRdgNkz0mkXho7rsTL5VfNvM47w&s"
                                            />
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 mt={1} display="flex" className="wallet-bar" px={2} py={1} justifyContent="space-between" alignItems="center" onClick={doWalletConnect}>
                                        <Typography variant="h6">
                                            WALLETCONNECT
                                        </Typography>
                                        <Grid2
                                            borderRadius={2.5}
                                            px={1}
                                            py={1.5}
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            overflow="hidden"
                                            sx={{background: "#3A99FB"}}
                                        >
                                            <img alt="metamask"
                                                width={20}
                                                src="https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg"
                                            />
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                            </Grid2>
                        </Modal>
                    </Grid2>
                </Container>
            </Container>
            <Container className="header marquee-header" maxWidth={false}>
                <Container maxWidth="lg">
                    <Marquee
                        autoFill={true}
                        gradient={true}
                        gradientColor={[0x12, 0x12, 0x12]}
                        gradientWidth={100}
                        className="text-upppercase"
                    >
                        <Grid2 display="flex" gap={1} py={1} px={2} alignItems="center">
                            <Typography color="gray" fontSize="small">
                                TOTAL {chain?chain.nativeCurrency.symbol:CHAINS[0].nativeCurrency.symbol} MIXED
                            </Typography>
                            <Typography color="white" fontSize="small">
                                {mixed.toLocaleString(undefined, {maximumFractionDigits: 1})}
                            </Typography>
                            <img src={NETWORK_LOGOS[(chain?chain.id:CHAINS[0].id) as keyof typeof NETWORK_LOGOS]} alt="coin" width={20} />
                        </Grid2>
                        <Grid2 display="flex" gap={1} py={1} px={2}>
                            <Typography color="gray" fontSize="small">
                                TOTAL VALUE MIXED
                            </Typography>
                            <Typography color="white" fontSize="small">
                                ${(mixed*price).toLocaleString(undefined, {maximumFractionDigits: 2})}
                            </Typography>
                        </Grid2>
                        <Grid2 display="flex" gap={1} py={1} px={2}>
                            <Typography color="gray" fontSize="small">
                                MIXERS
                            </Typography>
                            <Typography color="white" fontSize="small">
                                {mixers.toLocaleString()}
                            </Typography>
                        </Grid2>
                        <Grid2 display="flex" gap={1} py={1} px={2} alignItems="center">
                            <Typography color="gray" fontSize="small">
                                TOTAL {chain?chain.nativeCurrency.symbol:CHAINS[0].nativeCurrency.symbol} IN MIXERS
                            </Typography>
                            <Typography color="white" fontSize="small">
                                {balance.toLocaleString(undefined, {maximumFractionDigits: 1})}
                            </Typography>
                            <img src={NETWORK_LOGOS[(chain?chain.id:CHAINS[0].id) as keyof typeof NETWORK_LOGOS]} alt="coin" width={20} />
                        </Grid2>
                    </Marquee>
                </Container>
            </Container>
        </>
    );
}