const getReturnAmount=(answers)=>{
    return answers.stake*parseFloat(answers.ratio.split(':')[1])/parseFloat(answers.ratio.split(':')[0]);
}

const totalAmtToBePaid=(answers)=>{
    return answers.stake;
}

const randomNumber=(min, max)=>{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    getReturnAmount,
    totalAmtToBePaid,
    randomNumber
}