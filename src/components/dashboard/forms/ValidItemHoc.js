import React from 'react'
import { useSelector } from 'react-redux'

import PropTypes from 'prop-types'
import { execute, validate } from 'actions'
import { selectValidationsById } from 'selectors'

export default function ValidationHoc(Decorated) {
	const ValidItem = props => {
		const validations =
			useSelector(state => selectValidationsById(state, props.validateId)) || {}

		const makeValidation = (
			key,
			{ isValid, err = { msg: '', args: [] }, dirty = false, removeAll = false }
		) => {
			const { validateId } = props
			execute(validate(validateId, key, { isValid, err, dirty, removeAll }))
		}

		return (
			<Decorated
				{...props}
				validate={makeValidation}
				invalidFields={validations}
			/>
		)
	}

	ValidItem.propTypes = {
		validateId: PropTypes.string.isRequired,
	}

	return ValidItem
}
