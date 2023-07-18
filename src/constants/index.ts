import { mainnet as network1 } from "wagmi/chains";
import { bsc as network2 } from "wagmi/chains";
import { bscTestnet as network3 } from "wagmi/chains";

export const PROJECT_ID="8c5f9792a05e186182bec15a70d269bb";
export const EXPLORER_URL="https://etherscan.io";

export const RPC_URL = {
    1: "https://1rpc.io/eth",
    5: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    56: "https://bsc.publicnode.com",
    97: "https://data-seed-prebsc-1-s1.binance.org:8545"
}

export const NETWORK_LOGOS = {
    1: "https://img.icons8.com/external-vitaliy-gorbachev-flat-vitaly-gorbachev/512/external-ethereum-cryptocurrency-vitaliy-gorbachev-flat-vitaly-gorbachev.png", // eth
    5: "https://img.icons8.com/external-vitaliy-gorbachev-flat-vitaly-gorbachev/512/external-ethereum-cryptocurrency-vitaliy-gorbachev-flat-vitaly-gorbachev.png", // goerli
    56: "https://cdn-icons-png.flaticon.com/512/6001/6001283.png", // bsc
    97: "https://cdn-icons-png.flaticon.com/512/6001/6001283.png" // bsc test
};

export const VALUE_STEPS = ['0.1', '0.5', '1', '5', '10', '100']; // deposit values

export const CONTRACTS = {
    // contract addresses on testnet
    5: {
        '0.1': "0x157b1854860e48cc51E47abe68E73C51987d43E4",
        '0.5': "0x20438D23D45ec3507b015428C28dA28253C427a1",
        '1': "0x13CA94C7859EF32cBe46721f9A5f69987ea0904C",
        '5': "0x4963D73d4B11bBb8D0275712F7fa6AC332260d90",
        '10': "0xE7BAea860e807add4d3b218218E8050B596A0cE0",
        '100': "0x4e007162335bC6342621DE8ccd24c5EA1B611753"
    },
    97: {
        '0.1': "0x82345BF211F0a502E5134A1D519EC7B1FE1a32Fe",
        '0.5': "0xA387164a4B9c72917Fc3239Eb29f11551D9B8A3B",
        '1': "0x4153bfA84e747012bbAcd97A5b284eca91be96eB",
        '5': "0x4963D73d4B11bBb8D0275712F7fa6AC332260d90",
        '10': "0xE7BAea860e807add4d3b218218E8050B596A0cE0",
        '100': "0x4e007162335bC6342621DE8ccd24c5EA1B611753"
    },
    // contract addresses on mainnet
    1: {
        '0.1': "0x4353388efB4d116FfE305b51602E1237d7427Aa1",
        '0.5': "0x42E9aa6f8dCCbe6D308766B66C2757Cb84ACC987",
        '1': "0x6ce955A86251838b3152A241A31815b818f4a698",
        '5': "0x0Ff37e95f3caA716E47cc675547469dF4e9BDE23",
        '10': "0xe484d744Dcd6e47Fca10F789879Cc2fb5d9d4aBe",
        '100': "0x77430E9a09BF2B2E4ba4F19a6D8E3dD48687ef9A"
    },
    56: {
        '0.1': "0x42E9aa6f8dCCbe6D308766B66C2757Cb84ACC987",
        '0.5': "0x6ce955A86251838b3152A241A31815b818f4a698",
        '1': "0x0Ff37e95f3caA716E47cc675547469dF4e9BDE23",
        '5': "0xe484d744Dcd6e47Fca10F789879Cc2fb5d9d4aBe",
        '10': "0x77430E9a09BF2B2E4ba4F19a6D8E3dD48687ef9A",
        '100': "0x9256D61Bd202325aF04B7ce893aB4d5BBe3f7029"
    }
}

export const PRICE_FEED = {
    1: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    5: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    56: "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A",
    97: "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A"
}

export const TOKENS = {
    1: "ETH",
    5: "ETH",
    56: "BNB",
    97: "BNB"
};

export const SERVER_URL = "https://backend.peercash.io"; // backend url
// export const SERVER_URL = "http://localhost:5000"; // backend url

export const CHAINS = [network1];