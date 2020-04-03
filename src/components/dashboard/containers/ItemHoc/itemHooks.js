import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { selectItemByTypeAndId } from 'selectors'

export function useItem({ itemType, match, objModel }) {
	const [item, setItem] = useState({})
	const [initialItemState, setInitialItemState] = useState({})
	const [activeFields, setFields] = useState({})
	const [dirtyProps, setDirtyProps] = useState([])

	const storeItem = useSelector(state =>
		selectItemByTypeAndId(state, itemType, match.params.itemId)
	)

	useEffect(() => {
		const initial = new objModel(storeItem)
		setItem(initial)
		setInitialItemState(initial)
	}, [objModel, storeItem])

	const returnPropToInitialState = useCallback(
		propName => {
			const newItem = new objModel(item)
			newItem[propName] = initialItemState[propName]

			const dp = dirtyProps.filter(dp => {
				return dp !== propName
			})

			setItem(newItem)
			setDirtyProps(dp)
		},
		[dirtyProps, initialItemState, item, objModel]
	)

	const setActiveFields = useCallback(
		(field, value) => {
			setFields({ ...activeFields, [field]: value })
		},
		[activeFields]
	)

	const updateField = useCallback(
		(field, value) => {
			const newItem = new objModel(item)
			newItem[field] = value

			const dp = dirtyProps.slice(0)

			if (!dp.includes(field)) {
				dp.push(field)
			}
			setItem(newItem)
			setDirtyProps(dp)
		},
		[dirtyProps, item, objModel]
	)

	return {
		item,
		activeFields,
		setActiveFields,
		returnPropToInitialState,
		updateField,
	}
}