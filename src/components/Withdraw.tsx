import { Backdrop, Button, CircularProgress, Container, TextField, ThemeProvider, Typography } from "@mui/material";
import { CommonPageProps } from "../constants/types";
import { customTheme } from "../constants/theme";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useContract, useNetwork, useProvider, useSigner } from "wagmi";
import { ChangeEvent, useState } from "react";
import { CHAINS, CONTRACTS, VALUE_STEPS } from "../constants";
import { parseNote } from "../utils/Strings";
import { enqueueSnackbar } from "notistack";
import abi from "../abi/mixer.json";
import { ethers } from "ethers";
import { getProof } from "../utils/Axios";

export const Withdraw:React.FC<CommonPageProps> = ({toRefresh, setToRefresh}) => {
    const { chain } = useNetwork();
    const [showBackdrop, setShowBackDrop] = useState(false);
    const [backDropMsg, setBackDropMsg] = useState("");
    const [noteForWithdraw, setNoteForWithdraw] = useState("");
    
    const [receipient, setReceipient] = useState("");
    const [loadingWithdraw, setLoadingWithdraw] = useState(false);
    const [withdrawChain, setWithdrawChain] = useState("1");
    const [withdrawAmount, setWithdrawAmount] = useState(VALUE_STEPS[0]);

    const handleChangeNote = (event: ChangeEvent<HTMLInputElement>) => {
        const newNote = event.target.value;
        setNoteForWithdraw(newNote);
        try{
            let parsedNote = parseNote(newNote);
            setWithdrawChain(parsedNote.netId.toString());
            setWithdrawAmount(parsedNote.amount?.toString());
        } catch (ex:any) {
            console.log(ex)
            enqueueSnackbar(ex.message, {
                variant: "error"
            });
        }
    }
    
    const { data: signer } = useSigner();
    const contract = useContract({
        address: `0x${CONTRACTS[Number(withdrawChain) as keyof typeof CONTRACTS]?.[withdrawAmount as keyof typeof CONTRACTS[5]]?.substring(2)}`,
        abi: abi,
        signerOrProvider: signer
    });

    const provider = useProvider();

    const handleWithdraw = async () => {
        if (!noteForWithdraw || !receipient)
            return;
        setLoadingWithdraw(true);
        try {
            parseNote(noteForWithdraw);
            if (chain?.id !== Number(withdrawChain)) {
                const chainName = ethers.providers.getNetwork(Number(withdrawChain)).name;
                enqueueSnackbar(`Retry after switch network to ${chainName}.`, {
                    variant: "warning"
                });
                await switchNetworkAsync?.(Number(withdrawChain));
                setLoadingWithdraw(false);
            } else {    
                setShowBackDrop(true);
                setBackDropMsg("Getting Proof");
                const params = await getProof(noteForWithdraw, receipient);
                setBackDropMsg("Please confirm sending transaction");
                let tx = await contract?.withdraw(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
                setBackDropMsg("Sending transaction");
                
                let result = await tx?.wait();

                const waitingFor20Block = async ()=>{
                    const curBlock = await provider.getBlockNumber();
                    if(result?.blockNumber) {
                        if(curBlock - result?.blockNumber <= 20) {
                            setBackDropMsg(`Waiting for transaction confirmation ${curBlock - result?.blockNumber}/20`);
                            setTimeout(waitingFor20Block, 1000);
                        } else {
                            completeWithdraw();
                        }
                    }                
                }
                waitingFor20Block();

                const completeWithdraw = () => {
                    setBackDropMsg("");
                    setShowBackDrop(false);
                    enqueueSnackbar(`Withdraw is done.`, {
                        variant: "success"
                    });
                    setToRefresh(!toRefresh);
                    setLoadingWithdraw(false);
                }
            }
        } catch (_e) {
            enqueueSnackbar((_e as Error).message, {
                variant: "error"
            });
            setLoadingWithdraw(false);
            setShowBackDrop(false);
        }
    };
    return (
        <ThemeProvider theme={customTheme}>
            <Container maxWidth={false}>
                <Container maxWidth="lg">
                    <Grid2 display="flex" pt={10}>
                        <Grid2 flex={1} minWidth={330} display="flex" flexDirection="column" gap={2}>
                            <Typography variant="h4" color="white">
                                Withdraw
                            </Typography>
                            <Typography color="gray">
                                Withdraw Fee: 0.015%
                            </Typography>
                        </Grid2>
                        <Grid2 flex={1}></Grid2>
                    </Grid2>

                    <Grid2 my={5} display="flex" borderRadius={2} overflow="hidden" border="1px solid #272729" flexWrap="wrap">
                        <Grid2 minWidth={300} flex={3} sx={{background: "rgba(0, 0, 0, 0.5)"}} p={2} py={4} display="flex" flexDirection="column" gap={2} justifyContent="center" alignItems="center">
                            <Grid2 width="100%" maxWidth={500}>
                                <Grid2>
                                    <Typography color="white" variant="h6">
                                        Note
                                    </Typography>
                                </Grid2>
                                <Grid2 mt={1} display="flex" mx="auto" width="100%">
                                    <TextField fullWidth variant="outlined" value={noteForWithdraw} onChange={handleChangeNote} />
                                </Grid2>
                            </Grid2>
                            <Grid2 width="100%" maxWidth={500} mb={1}>
                                <Grid2>
                                    <Typography color="white" variant="h6">
                                        Receipient Address
                                    </Typography>
                                </Grid2>
                                <Grid2 mt={1} display="flex" mx="auto" width="100%">
                                    <TextField fullWidth variant="outlined" value={receipient} onChange={(event:any) => setReceipient(event.target.value)} />
                                </Grid2>
                            </Grid2>
                        </Grid2>
                        <Grid2 minWidth={300} flex={2} sx={{background: "#121212"}} p={3} display="flex" flexDirection="column" justifyContent="center">
                            <Typography width="100%" color="gray" variant="h6">
                                Summary
                            </Typography>
                            <Grid2 width="100%" borderRadius={1.5} border="1px solid #272729" p={2} display="flex" gap={2} flexDirection="column">
                                <Grid2 display="flex" justifyContent="space-between">
                                    <Typography color="gray">
                                        Amount to Withdraw:
                                    </Typography>
                                    <Typography color="white">
                                        {withdrawAmount}
                                    </Typography>
                                </Grid2>
                                <Grid2 display="flex" justifyContent="space-between">
                                    <Typography color="gray">
                                        Blockchain:
                                    </Typography>
                                    <Typography color="white">
                                        {chain?.name}
                                    </Typography>
                                </Grid2>
                                <Button variant="contained" color="primary" onClick={handleWithdraw}>
                                    WITHDRAW
                                </Button>
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </Container>
            </Container>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme:any) => theme.zIndex.drawer + 1 }}
                open={showBackdrop}
            >
                <CircularProgress color="inherit" sx={{marginRight: "0.5em"}} /> {backDropMsg}
            </Backdrop>
        </ThemeProvider>
    );
}

function switchNetworkAsync(arg0: number) {
    throw new Error("Function not implemented.");
}
