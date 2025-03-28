const hre = require('hardhat');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Network URL:', hre.network.config.url);
  console.log('Deploying from account:', deployer.address);
  console.log('Network:', hre.network.name);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());
  const CourseRegistration = await hre.ethers.getContractFactory('CourseRegistration');
  console.log('Deploying contract...');
  const courseRegistration = await CourseRegistration.deploy();
  console.log('Waiting for deployment...');
  await courseRegistration.waitForDeployment();
  const contractAddress = courseRegistration.target;
  console.log('CourseRegistration deployed to:', contractAddress);

  // Save ABI
  const artifact = await hre.artifacts.readArtifact('CourseRegistration');
  const abi = artifact.abi;
  const abiPath = path.resolve(__dirname, '../abi.json');
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  console.log('ABI written to abi.json');

  // Update .env
  const envPath = path.resolve(__dirname, '../.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, '').trim();
  envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
  fs.writeFileSync(envPath, envContent);
  console.log('Updated .env with CONTRACT_ADDRESS');
}


main().catch((error) => {
  console.error('Deployment failed:', error);
  process.exitCode = 1;
});