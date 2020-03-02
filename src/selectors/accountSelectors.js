import { createSelector } from 'reselect'
import { createDeepEqualSelector, selectMainToken } from 'selectors'
import { bigNumberify, parseUnits } from 'ethers/utils'

const MIN_PUBLISHER_REVENUE = '30'

export const selectAccount = state => state.persist.account || {}
export const selectChannels = state => state.persist.channels

export const selectAuth = createSelector(
	selectAccount,
	({ wallet, identity }) =>
		!!wallet &&
		!!wallet.address &&
		!!wallet.authSig &&
		!!wallet.authType &&
		!!identity.address
)

export const selectWallet = createDeepEqualSelector(
	selectAccount,
	({ wallet }) => wallet || {}
)

export const selectEmail = createSelector(
	selectAccount,
	({ email }) => email
)

export const selectEmailProvider = createSelector(
	selectEmail,
	email => (!!email ? email.split('@')[1] : null)
)

export const selectAuthSig = createSelector(
	selectWallet,
	({ authSig }) => authSig
)

export const selectWalletAddress = createSelector(
	selectWallet,
	({ address }) => address
)

export const selectAuthType = createSelector(
	selectWallet,
	({ authType }) => authType
)

export const selectAccountIdentity = createSelector(
	selectAccount,
	({ identity }) => identity || {}
)

export const selectAccountIdentityAddr = createSelector(
	selectAccountIdentity,
	({ address }) => address
)

export const selectAccountStats = createSelector(
	selectAccount,
	({ stats }) => stats || {}
)

export const selectAccountSettings = createSelector(
	selectAccount,
	({ settings }) => settings || {}
)

export const selectAccountStatsRaw = createSelector(
	selectAccountStats,
	({ raw }) => raw || {}
)

export const selectAccountStatsFormatted = createSelector(
	selectAccountStats,
	({ formatted }) => formatted || {}
)

export const selectAccountIdentityRoutineAuthTuple = createSelector(
	selectAccountIdentity,
	({ relayerData }) =>
		relayerData &&
		relayerData.routineAuthorizationsData &&
		relayerData.routineAuthorizationsData[0]
			? relayerData.routineAuthorizationsData[0]
			: null
)

export const selectAccountIdentityDeployData = createSelector(
	selectAccountIdentity,
	({ relayerData }) => relayerData.deployData
)

export const selectChannelsWithUserBalances = createSelector(
	selectChannels,
	({ withBalance }) => withBalance || {}
)

export const selectChannelsWithUserBalancesEligible = createSelector(
	selectChannels,
	({ withOutstandingBalance }) => [...(withOutstandingBalance || [])]
)

export const selectChannelsWithUserBalancesAll = createSelector(
	selectChannels,
	({ withBalanceAll }) => ({ ...(withBalanceAll || {}) })
)

export const selectAccountIdentityCurrentPrivileges = createSelector(
	selectAccountIdentity,
	({ relayerData: { currentPrivileges } = {} }) => currentPrivileges || {}
)

export const selectWalletPrivileges = createSelector(
	[selectAccountIdentityCurrentPrivileges, selectWalletAddress],
	(privileges = {}, address) => privileges[address] || 0
)

export const selectPublisherMinRevenueReached = createSelector(
	[selectAccountStatsRaw, selectMainToken],
	({ totalRevenue }, { decimals }) =>
		bigNumberify(totalRevenue || 0).gt(
			parseUnits(MIN_PUBLISHER_REVENUE, decimals)
		)
)
