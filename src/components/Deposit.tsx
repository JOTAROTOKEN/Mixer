import { Backdrop, Button, CircularProgress, Container, ThemeProvider, Typography } from "@mui/material"
import { customTheme } from "../constants/theme"
import Grid2 from "@mui/material/Unstable_Grid2"
import { CONTRACTS, RPC_URL, VALUE_STEPS } from "../constants"
import { useEffect, useState } from "react"
import { useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi"
import { getCommitment } from "../utils/Axios"
import { CommonPageProps } from "../constants/types"
import abi from "../abi/mixer.json"
import { ethers } from "ethers"
import { enqueueSnackbar } from "notistack"
import { downloadText, getNoteString } from "../utils/Strings"

export const Deposit:React.FC<CommonPageProps> = ({toRefresh, setToRefresh}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [activeValue, setActiveValue] = useState(VALUE_STEPS[0]);
    const handleStep = (step: number) => () => {
        setActiveStep(step);
        setActiveValue(VALUE_STEPS[step]);
    };
    const { chain } = useNetwork();
    const [note, setNote] = useState("");
    const [depositCommit, setDepositCommit] = useState("");
    const [loadingCommit, setLoadingCommit] = useState(false);

    useEffect(() => {
        setLoadingCommit(true);
        getCommitment().then(re => {
            setNote(re.note);
            setDepositCommit(re.commitment);
            setLoadingCommit(false);
        })
    }, [toRefresh]);

    const { config } = usePrepareContractWrite({
        address: `0x${CONTRACTS[chain?.id as keyof typeof CONTRACTS]?.[VALUE_STEPS[activeStep] as keyof typeof CONTRACTS[5]]?.substring(2)}`,
        abi: abi,
        functionName: 'deposit',
        args: [depositCommit],
        overrides: {
            value: ethers.utils.parseEther(VALUE_STEPS[activeStep])
        }
    });

    const { writeAsync: doDeposit } = useContractWrite(config);
    const [loadingDeposit, setLoadingDeposit] = useState(false);
    const [showBackdrop, setShowBackDrop] = useState(false);
    const [backDropMsg, setBackDropMsg] = useState("");

    const handleDeposit = async () => {
        if(doDeposit === undefined) {
            enqueueSnackbar(`Not enough balance`, {
                variant: "error"
            });
            return;
        }
        enqueueSnackbar(`You must save this downloaded note file. It's used to withdraw your fund.`, {
            variant: "warning"
        });
        downloadText(`Note-${chain?.nativeCurrency?.symbol}-${VALUE_STEPS[activeStep]}.txt`, getNoteString(chain?.nativeCurrency?.symbol??"", Number(VALUE_STEPS[activeStep]), chain?.id ?? 1, note));
        try {
            setLoadingDeposit(true);
            setShowBackDrop(true);
            setBackDropMsg("Please confirm sending transaction");
            let tx = await doDeposit?.();
            setBackDropMsg("Sending transaction");
            let result = await tx?.wait();
            const provider = new ethers.providers.JsonRpcProvider(RPC_URL[(chain?.id??1) as keyof typeof RPC_URL]);
            const waitingFor20Block = async ()=>{
                const curBlock = await provider.getBlockNumber();
                if(result?.blockNumber) {
                    if(curBlock - result?.blockNumber <= 20) {
                        setBackDropMsg(`Waiting for transaction confirmation ${curBlock - result?.blockNumber}/20`);
                        setTimeout(waitingFor20Block, 1000);
                    } else {
                        completeDeposit();
                    }
                }                
            }
            waitingFor20Block();

            const completeDeposit = () => {
                setShowBackDrop(false);
                setBackDropMsg("");
                enqueueSnackbar(`Deposit is made.`, {
                    variant: "success"
                });
                setToRefresh(!toRefresh);
                setLoadingDeposit(false);
            };
        } catch (ex) {
            setShowBackDrop(false);
            setLoadingDeposit(false);
        }
    };
    return (
        <ThemeProvider theme={customTheme}>
            <Container maxWidth={false}>
                <Container maxWidth="lg">
                    <Grid2 display="flex" pt={10}>
                        <Grid2 flex={1} minWidth={330} display="flex" flexDirection="column" gap={2}>
                            <Typography variant="h4" color="white">
                                Explore the Anonymity of DEX with Jorato's MIXER
                            </Typography>
                            <Typography color="gray">
                                You can obscure the origin and destination of your funds, making it difficult for anyone to trace your transactions or link them to your identity.
                            </Typography>
                        </Grid2>
                        <Grid2 flex={1}></Grid2>
                    </Grid2>

                    <Grid2 my={5} display="flex" borderRadius={2} overflow="hidden" border="1px solid #272729" flexWrap="wrap">
                        <Grid2 minWidth={300} flex={3} sx={{background: "rgba(0, 0, 0, 0.5)"}} p={2} display="flex" justifyContent="center" alignItems="center">
                            <Grid2 width="min-content">
                                <Grid2>
                                    <Typography color="white" variant="h6">
                                        Amount to Mix
                                    </Typography>
                                </Grid2>
                                <Grid2 mt={2} display="flex" gap={1} mx="auto" width="max-content" p={1} border="1px solid #272729" borderRadius={1.5} sx={{background: "#121212"}} maxWidth="100%" overflow="auto">
                                    {VALUE_STEPS.map((label, index) => (
                                        <Button key={index} variant="contained" color={index === activeStep?"primary":"secondary"} onClick={handleStep(index)}>
                                            {label}
                                        </Button>
                                    ))}
                                </Grid2>
                            </Grid2>
                        </Grid2>
                        <Grid2 minWidth={300} flex={2} sx={{background: "#121212"}} p={3}>
                            <Typography color="gray" variant="h6">
                                Summary
                            </Typography>
                            <Grid2 borderRadius={1.5} border="1px solid #272729" p={2} display="flex" gap={2} flexDirection="column">
                                <Grid2 display="flex" justifyContent="space-between">
                                    <Typography color="gray">
                                        Amount to Mix:
                                    </Typography>
                                    <Typography color="white">
                                        {activeValue}
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
                                <Button disabled={!chain || loadingCommit} variant="contained" color="primary" onClick={handleDeposit}>
                                    Deposit
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
    )
}