const solc = require('./index.js');
const config = require('./titanrc.js');
const Web3 = require("aion-web3");

const pubKeyL = config.lenovoAccount.address;

const provider = new Web3.providers.HttpProvider(config.nodeAddress.aion);
const web3 = new Web3(provider);

const input = `pragma solidity ^0.4.9;

contract WithConstructor {
  uint128 public num = 5;
  address owner;

  // modifier onlyMe() {
  //     if(msg.sender != owner) throw;
  //     _;
  // }

  event NumChanged (address x);

  function WithConstructor(uint128 a, bytes32 br) public {
    // owner = msg.sender;
    num = a;
    // NumChanged(msg.sender);
  }

  function add(uint128 a) public returns (uint128) {
    return num + a;
  }

  function setA(uint128 a) payable public {
    num = a;
    // NumChanged(a);
  }
}

contract Test {
  bytes32 public name = 5;

  function Test(bytes32 _name) public {
    name = _name;
  }
}`;

const compileOnNode = async contract => {
  const output = await web3.eth.compileSolidity(contract);
  console.dir(output);
  return output;
};

const compileWithSolc = async contract => {
  const output = solc.compile(contract, 1);
  console.dir(output);
  return output;
};

const unlock = async (address, password, duration) => {
  return await web3.eth.personal.unlockAccount(address, password, duration);
};

const deploy = async () => {
//   const compiled = await compileOnNode(input)
//   const abi = compiled.WithConstructor.info.abiDefinition;
//   const code = compiled.WithConstructor.code;
//   console.log(compiled['WithConstructor'], abi, code);

  const { contracts } = await compileWithSolc(input);
  const abi = contracts[":WithConstructor"].interface;
  const code = contracts[":WithConstructor"].bytecode;

  const args = ["69", "Test"];
  const gas = await web3.eth.getBlock("latest").gasLimit;
  const gasPrice = await web3.eth.gasPrice;

  const contract = new web3.eth.Contract(JSON.parse(abi));
  console.log(await unlock(pubKeyL, "PLAT4life", 10000));
  const instance = await contract
    .deploy({
      data: code,
      arguments: args
    })
    .send({
      from: pubKeyL,
      gas: 2000000,
      gasPrice
    });
  console.log(instance);
  return instance.options.address;
};

const num = async deployedAddress => {
  console.log("calling num()");
  const { contracts } = await compileWithSolc(input);
  const abi = contracts[":WithConstructor"].interface;

//   const compiled = await compileOnNode(input)
//   const abi = compiled.WithConstructor.info.abiDefinition;

  const contractInstance = new web3.eth.Contract(
    JSON.parse(abi),
    (address = deployedAddress)
  );

  const { gasLimit } = await web3.eth.getBlock("latest");
  const gasPrice = await web3.eth.gasPrice;

  const val = await contractInstance.methods.num().call({ from: pubKeyL });
  console.log(val);
};

const add = async deployedAddress => {
  console.log("calling add()");
  const { contracts } = await compileWithSolc(input);
  const abi = contracts[":WithConstructor"].interface;

//   const compiled = await compileOnNode(input)
//   const abi = compiled.WithConstructor.info.abiDefinition;

  const contractInstance = new web3.eth.Contract(
    JSON.parse(abi),
    (address = deployedAddress)
  );

  const { gasLimit } = await web3.eth.getBlock("latest");
  const gasPrice = await web3.eth.gasPrice;

  const val = await contractInstance.methods.add(12).call({ from: pubKeyL });
  console.log(val);
};

const setA = async deployedAddress => {
  console.log("calling setA()");
  const { contracts } = await compileWithSolc(input);
  const abi = contracts[":WithConstructor"].interface;

//   const compiled = await compileOnNode(input)
//   const abi = compiled.WithConstructor.info.abiDefinition;

  const contractInstance = new web3.eth.Contract(
    JSON.parse(abi),
    (address = deployedAddress)
  );

  const { gasLimit } = await web3.eth.getBlock("latest");
  const gasPrice = await web3.eth.gasPrice;

  const val = await contractInstance.methods.setA(12).send({ from: pubKeyL, value: web3.utils.toNAmp('100', 'aion') });
  console.log(val);
};

deploy().then(async (a) => {
    await setA(a)
    await num(a)
    await add(a)
});