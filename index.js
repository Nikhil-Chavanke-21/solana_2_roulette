// The way it is expected to implement the assignment, it isn't the way actually roulette works.
// and can be tricked to get more profit.
// any stake ratio greater than 1:5 will result in loss of the organiser

const {
    Keypair,
} = require("@solana/web3.js");
const figlet = require('figlet');
const chalk = require('chalk');
const inquirer = require('inquirer');

const {getWalletBalance,transferSOL,airDropSol}=require("./solana");
const { getReturnAmount, totalAmtToBePaid, randomNumber } = require('./helper');

// this is the betting account
let fromSeed = Uint8Array.from([70,60,102,100,70,60,102,100,70,60,102,100,70,60,102,100,70,60,102,100,70,60,102,100,70,60,102,100,70,60,102,100]);    // 6.199 sol
// this is the roulette account
let toSeed = Uint8Array.from([94,50,72,186,233,25,83,244,216,176,178,121,190,98,76,54,154,176,220,229,121,200,84,253,80,120,118,150,8,241,183,65]);    // 4 sol

let from = Keypair.fromSeed(fromSeed);
let to = Keypair.fromSeed(toSeed);

// console.log(from.publicKey.toBase58());
// console.log(from.secretKey);

const questions = [
  {
    type: 'number',
    name: 'stake',
    message: "What is the amount of SOL you want to stake?",
    validate(value) {
      if(value<=2.5)return true;
      return 'Please enter amount less than 2.5 SOL';
    },
  },
  {
    type: 'input',
    name: 'ratio',
    message: "What is the ratio of your staking?",
    validate(value) {
      const pass = value.match(
        /^([0-9]*[.])?[0-9]+:([0-9]*[.])?[0-9]+$/i
      );
      if (pass) {
        return true;
      }
      return 'Please enter a valid ratio';
    },
  },
];

const question = [
  {
    type: 'number',
    name: 'guess',
    message: "Guess a random number from 1 to 5 (both 1, 5 included)",
    validate(value) {
      if(value==1 || value==2 || value==3 || value==4 || value==5)return true;
      return 'Please select a number from 1 to 5';
    },
  },
];

figlet('SOL Stake', async function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }

    console.log(chalk.green(data));
    console.log(chalk.yellow('The max bidding amount is 2.5 SOL here'));

    // code to airdrop sol in better's account
    // await airDropSol(from);
    // code to airdrop sol in roulette's account
    // await airDropSol(to);

    let fromBalance, toBalance;
    fromBalance = await getWalletBalance(from.publicKey.toString());
    toBalance = await getWalletBalance(to.publicKey.toString());

    console.log(chalk.blue('--------------------Before Bet--------------------'));
    console.log("Balance in better's account-", fromBalance);
    console.log("Balance in roulette's account", toBalance);
    console.log(chalk.blue('--------------------------------------------------'));

    await inquirer.prompt(questions).then(async (answers) => {
      console.log('You need to pay', chalk.green(totalAmtToBePaid(answers)), 'to move forward');
      console.log(chalk.green('You will get '+chalk.green(getReturnAmount(answers))+' if guessing the number correctly'));
      await inquirer.prompt(question).then(async (answer) => {
        const betSignature = await transferSOL(from, to, totalAmtToBePaid(answers));
        console.log('Signature of payment for playing the game', chalk.green(betSignature));
        const random=randomNumber(1, 5);
        // if(answer.guess==random){
          const prizeSignature = await transferSOL(to, from, getReturnAmount(answers));
          console.log(chalk.green('Your guess is absolutely correct'));
          console.log('Here is the price signature', chalk.green(prizeSignature));
        // } else {
        //   console.log(chalk.yellow('Better luck next time'));
        // }
      });
    });
    fromBalance = await getWalletBalance(from.publicKey.toString());
    toBalance = await getWalletBalance(to.publicKey.toString());

    console.log(chalk.blue('--------------------After Bet--------------------'));
    console.log("Balance in better's account-", fromBalance);
    console.log("Balance in roulette's account", toBalance);
    console.log(chalk.blue('--------------------------------------------------'));
});