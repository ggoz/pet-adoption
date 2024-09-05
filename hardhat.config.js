require("@nomicfoundation/hardhat-toolbox");

const keys = require("./keys.json");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    localhost: {},
    polygon_amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [keys.DEPLOY_SECRET_KEY],
      timeout: 2000000 // 增加超时时间，单位是毫秒
    }
  },
  etherscan: {
    apiKey: keys.POLYGON_API_KEY
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
