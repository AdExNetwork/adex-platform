import { getEthers } from 'services/smart-contracts/ethers'
import { BigNumber, utils } from 'ethers'
import { formatTokenAmount } from 'helpers/formatters'
import { selectMainToken } from 'selectors'
import { AUTH_TYPES } from 'constants/misc'
import { privilegesNames, getWithdrawTokensBalances } from './stats'
import { getPrices } from 'services/prices'
import { assets, mappers } from 'services/adex-wallet/assets'

const ZERO = BigNumber.from(0)

async function getAssetsData({ identityAddress, authType }) {
	const assetsBalances = (await Promise.all(
		Object.entries(assets).map(async ([address, { getBalance, symbol }]) => {
			const balance = await getBalance({ address: identityAddress })
			const baseTokenBalance = mappers[address]
				? await mappers[address](balance)
				: balance
			return {
				address,
				symbol,
				balance,
				baseTokenBalance,
			}
		})
	)).reduce((byAddress, data) => {
		byAddress[data.address] = data
		return byAddress
	}, {})

	const baseAssetsData = Object.entries(assets).reduce(
		(data, [address, asset]) => {
			if (asset.isBaseAsset) {
				const assetData = {
					...assetsBalances[address],
				}

				const { total, specific } = asset.subAssets.reduce(
					(data, subAddr) => {
						const subData = assetsBalances[subAddr]
						data.total = data.total.add(
							(subData.baseTokenBalance || [])[1] || ZERO
						)
						data.specific = [...data.specific, subData]

						return data
					},
					{ total: ZERO, specific: [] }
				)

				assetData.total = total.add(assetData.balance)
				assetData.specific = specific

				data[address] = assetData
			}

			return data
		},
		{}
	)

	return baseAssetsData
}

const withPricesValue = ({ prices, value }) => {
	return Object.entries(prices).reduce((updated, [key, pr]) => {
		updated[key] = value * pr
		return updated
	}, {})
}

const sumPricesValues = currenciesValues => {
	return Object.keys(currenciesValues[0] || {}).reduce((sumByKey, key) => {
		sumByKey[key] = currenciesValues.reduce((sum, value) => {
			if (value[key]) {
				sum = sum + value[key]
			}
			return sum
		}, 0)

		return sumByKey
	}, {})
}

export async function getAccountStatsWallet({ account }) {
	const { wallet, identity } = account
	// const { authType } = wallet
	const { address } = identity
	const { getIdentity } = await getEthers(AUTH_TYPES.READONLY)
	const { decimals } = selectMainToken()

	const { status = {} } = identity
	const identityContract = getIdentity({ address })
	let privilegesAction
	try {
		await identityContract.deployed()
		privilegesAction = identityContract.privileges(wallet.address)
	} catch {
		privilegesAction = Promise.resolve(status.type || 'Not Deployed')
	}

	const calls = [
		getAssetsData({ identityAddress: address }),
		getWithdrawTokensBalances({ address }),
		privilegesAction,
		getPrices(),
	]

	const [
		assetsData,
		identityWithdrawTokensBalancesBalances = {},
		walletPrivileges,
		prices,
	] = await Promise.all(
		calls.map(c =>
			c
				.then(res => res)
				.catch(e => {
					console.error(e)
					return undefined
				})
		)
	)

	const { withUsdValue, totalMainCurrenciesValues } = Object.entries(
		assetsData
	).reduce(
		(data, [key, asset]) => {
			const assetTotalValueFloat = utils.formatUnits(
				asset.total,
				asset.decimals
			)
			const assetToMainCurrenciesValues = withPricesValue({
				prices: prices[asset.symbol],
				value: assetTotalValueFloat,
			})

			data.withUsdValue[key] = { ...asset }
			data.withUsdValue[
				key
			].assetToMainCurrenciesValues = assetToMainCurrenciesValues

			data.totalMainCurrenciesValues = sumPricesValues([
				assetToMainCurrenciesValues,
				data.totalMainCurrenciesValues,
			])

			return data
		},
		{ withUsdValue: {}, totalMainCurrenciesValues: {} }
	)

	const identityBalanceMainToken =
		identityWithdrawTokensBalancesBalances.totalBalanceInMainToken ||
		BigNumber.from(0)

	// BigNumber values for balances
	const raw = {
		totalMainCurrenciesValues,
		assetsData: withUsdValue,
		identityWithdrawTokensBalancesBalances,
		walletPrivileges,
		identityBalanceMainToken,
	}

	const formattedAssetsData = Object.entries(withUsdValue).reduce(
		(formatted, [key, value]) => {
			const formattedValue = { ...value }
			formattedValue.balance = formatTokenAmount(
				value.balance,
				assets[key].decimals
			)

			formattedValue.baseTokenBalance = formatTokenAmount(
				value.baseTokenBalance,
				assets[key].decimals
			)

			formattedValue.total = formatTokenAmount(
				value.total,
				assets[key].decimals
			)

			formattedValue.specific = [...value.specific].map(v => {
				const specificFormatted = { ...v }
				specificFormatted.balance = formatTokenAmount(
					v.balance,
					assets[v.address].decimals
				)

				specificFormatted.baseTokenBalance = [...v.baseTokenBalance]
				specificFormatted.baseTokenBalance[1] = formatTokenAmount(
					v.baseTokenBalance[1],
					assets[key].decimals,
					true,
					2
				)

				return specificFormatted
			})

			formatted[key] = formattedValue
			return formatted
		},
		{}
	)

	const formatted = {
		totalMainCurrenciesValues, // TODO: format
		assetsData: formattedAssetsData,
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivileges: privilegesNames[walletPrivileges],
		identityAddress: identity.address,
		identityBalanceMainToken: formatTokenAmount(
			identityBalanceMainToken,
			decimals,
			true,
			2
		),
	}

	return {
		raw,
		formatted,
	}
}
