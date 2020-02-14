import Requester, { handleRequesterErrorRes } from 'services/requester'
import { logOut } from 'services/store-data/auth'
import moment from 'moment'

const ADEX_MARKET_HOST = process.env.ADEX_MARKET_HOST
const requester = new Requester({ baseUrl: ADEX_MARKET_HOST })

const processResponse = (res, dontThrow, skipRedirect) => {
	if (res.status >= 200 && res.status < 400) {
		return res.json()
	}

	return res.text().then(text => {
		if (res.status === 401 || res.status === 403) {
			logOut(skipRedirect)
		}
		if (!dontThrow) {
			handleRequesterErrorRes({ res, text })
		}
	})
}

export const getSession = ({
	identity,
	mode,
	signature,
	authToken,
	hash,
	typedData,
	signerAddress,
}) => {
	return requester
		.fetch({
			route: 'auth/',
			method: 'POST',
			body: JSON.stringify({
				identity,
				mode,
				signature,
				authToken,
				hash,
				typedData,
				signerAddress,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const checkSession = ({ authSig, skipErrToast }) => {
	return requester
		.fetch({
			route: 'session',
			method: 'GET',
			authSig,
			skipErrToast,
		})
		.then(res => processResponse(res, true, true))
}

export const uploadImage = ({ imageBlob, imageName = '', authSig }) => {
	const formData = new FormData()
	formData.append('media', imageBlob, imageName)
	return requester
		.fetch({
			route: 'media',
			method: 'POST',
			body: formData,
			authSig,
		})
		.then(processResponse)
}

const convertItemToJSON = item => {
	const itemToConvert = { ...item }
	if (itemToConvert.created && moment.isMoment(itemToConvert.created)) {
		itemToConvert.created = moment.unix(itemToConvert.created) / 1000
	}

	return JSON.stringify(itemToConvert)
}

export const getAdUnits = ({ identity }) => {
	return requester
		.fetch({
			route: 'units',
			method: 'GET',
			queryParams: { identity },
		})
		.then(processResponse)
}

export const postAdUnit = ({ unit, authSig }) => {
	return requester
		.fetch({
			route: 'units',
			method: 'POST',
			body: convertItemToJSON(unit),
			authSig,
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const updateAdUnit = ({ unit, id, authSig }) => {
	return requester
		.fetch({
			route: `units/${id}`,
			method: 'PUT',
			body: convertItemToJSON(unit),
			authSig,
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const getAdSlots = ({ identity }) => {
	return requester
		.fetch({
			route: 'slots',
			method: 'GET',
			queryParams: { identity },
		})
		.then(processResponse)
}

export const postAdSlot = ({ slot, authSig }) => {
	return requester
		.fetch({
			route: 'slots',
			method: 'POST',
			body: convertItemToJSON(slot),
			authSig,
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const updateAdSlot = ({ slot, id, authSig }) => {
	return requester
		.fetch({
			route: `slots/${id}`,
			method: 'PUT',
			body: convertItemToJSON(slot),
			authSig,
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const getCampaigns = ({ authSig, creator }) => {
	return requester
		.fetch({
			route: 'campaigns/by-owner',
			method: 'GET',
			noCache: true,
			queryParams: {
				byCreator: creator, //
				t: Date.now(),
			},
			authSig,
		})
		.then(processResponse)
}

export const closeCampaignMarket = ({ campaign, authSig }) => {
	return requester
		.fetch({
			route: `campaigns/${campaign.id}/close`,
			method: 'PUT',
			authSig,
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const getAllCampaigns = ({ all, statuses } = {}) => {
	const queryParams = {
		...(all && { all: true }),
		...(statuses && { status: statuses.join(',') }),
	}

	return requester
		.fetch({
			route: 'campaigns',
			method: 'GET',
			queryParams,
		})
		.then(processResponse)
}

export const updateCampaign = ({ campaign, id, authSig }) => {
	return requester
		.fetch({
			route: `campaigns/${id}`,
			method: 'PUT',
			body: convertItemToJSON(campaign),
			authSig,
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}