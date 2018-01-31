import { cfg, exchange, token, web3 } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { toHexParam } from 'services/smart-contracts/utils'
// import { encrypt } from 'services/crypto/crypto'
// import { registerItem } from 'services/smart-contracts/actions'
const GAS_LIMIT = 21000

export const withdrawEthEstimateGas = ({ _addr, withdrawTo, amountToWithdraw, prKey } = {}) => {

    let amount = web3.utils.toWei(amountToWithdraw, 'ether')

    return new Promise((resolve, reject) => {
        web3.eth.estimateGas({
            from: _addr,
            to: withdrawTo,
            value: amount
        })
            .then(function (res) {
                console.log('withdrawEthEstimateGas res', res)
                return resolve(res)
            })
            .catch((err) => {
                console.log('withdrawEthEstimateGas err', err)
                reject(err)
            })
    })
}

export const withdrawEth = ({ _addr, withdrawTo, amountToWithdraw, prKey, gas } = {}) => {

    let amount = web3.utils.toWei(amountToWithdraw, 'ether')

    return new Promise((resolve, reject) => {
        web3.eth.sendTransaction({
            from: _addr,
            to: withdrawTo,
            value: amount,
            gas: gas || GAS_LIMIT
        })
            .then(function (res) {
                console.log('withdrawEth res', res)
                return resolve(res)
            })
            .catch((err) => {
                console.log('withdrawEth err', err)
                reject(err)
            })
    })
}

export const getCurrentGasPrice = () => {
    return web3.eth.getGasPrice()
}

export const getAccountStats = ({ _addr }) => {
    return new Promise((resolve, reject) => {
        let balanceEth = web3.eth.getBalance(_addr)
        let balanceAdx = token.methods.balanceOf(_addr).call()
        let allowance = token.methods.allowance(_addr, cfg.addr.exchange).call()

        let all = [balanceEth, balanceAdx, allowance]

        Promise.all(all)
            .then(([balEth, balAdx, allow, ]) => {

                let accStats =
                    {
                        balanceEth: balEth,
                        balanceAdx: balAdx,
                        allowance: allow
                    }

                console.log('accStats', accStats)
                return resolve(accStats)
            })
            .catch((err) => {
                console.log('getAccountStats err', err)
                reject(err)
            })
    })
}
