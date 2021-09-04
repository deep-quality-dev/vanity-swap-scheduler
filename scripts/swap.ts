import { ethers, network } from "hardhat";
import VNYPaymentHandlerABI from "../abis/VNYPaymentHandler.json";
import config from "../config";
import logger from "../utils/logger";

const main = async () => {
  const networkName = network.name;

  const [operator] = await ethers.getSigners();

  const configConst: { [key: string]: any } = config.VNYPaymentHandler;

  console.log('network=', networkName);
  console.log('operator=', operator.address);
  console.log('VNYPaymentHandler address=', configConst[networkName]);

  if (networkName === 'testnet' || networkName === 'mainnet') {
    if (!process.env.OPERATOR_PRIVATE_KEY) {
      throw new Error('Missing private key(signer).');
    }

    try {
      const contract = await ethers.getContractAt(
        VNYPaymentHandlerABI,
        config.VNYPaymentHandler.testnet
      );

      // Get network data for running script.
      const [_blockNumber, _gasPrice] = await Promise.all([
        ethers.provider.getBlockNumber(),
        ethers.provider.getGasPrice(),
      ]);

      const tx = await contract.connect(operator).swapAllTokensForEth();
      // const tx = await contract.connect(operator).pay(100);

      const message = `[${new Date().toISOString()}] Done: network=${
        networkName
      } block=${_blockNumber.toString()} signer=${
        operator.address
      } hash=${
        tx?.hash
      }`;
      console.log(message);
      logger.info({ message });

      // const message = `[${new Date().toISOString()}] Done: network=${
      //   networkName
      // } block=${_blockNumber.toString()} signer=${
      //   operator.address
      // }`;
      // console.log(message);
      // logger.info({ message });

    } catch (error) {
      const message = `[${new Date().toISOString()}] Error: network=${networkName} signer=${
        operator.address
      }`;
      console.error(message);
      logger.error({ message });
      console.log(error);
    }
  } else {
    const message = `[${new Date().toISOString()}] Error: network=${
      networkName
    } message='Unsupported network`;
    console.error(message);
    logger.error(message);
  }
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});