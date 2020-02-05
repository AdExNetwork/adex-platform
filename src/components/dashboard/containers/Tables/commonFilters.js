import React from 'react'
import { Typography, Slider, Box } from '@material-ui/core'
import { formatAbbrNum, formatNumberWithoutCommas } from 'helpers/formatters'

export const sliderFilterOptions = ({ initial, filterTitle, stepSetting }) => {
	return {
		filter: true,
		display: 'true',
		filterType: 'custom',
		customFilterListOptions: {
			render: v =>
				`${filterTitle}: ${formatAbbrNum(v[0], 2)} - ${formatAbbrNum(v[1], 2)}`,
			update: (filterList, filterPos, index) => {
				filterList[index] = []
				return filterList
			},
		},

		filterOptions: {
			names: [],
			logic: (rowNumber, filters) => {
				const formated = Number(rowNumber.toString().replace(/[^0-9.]/g, ''))
				if (filters.length > 0) {
					return formated < filters[0] || formated > filters[1]
				}
				return false
			},
			display: (filterList, onChange, index, column) => {
				return (
					<Box>
						<Typography id={`range-slider-${column.name}`} gutterBottom>
							{filterTitle}
						</Typography>
						<Box pl={2} pr={3} pt={2}>
							<Slider
								min={initial[0] || 0}
								max={initial[1] || 100}
								marks={[
									{
										value: initial[0] || 0,
										label: formatAbbrNum(initial[0], 2),
									},
									{
										value: initial[1] || 100,
										label: formatAbbrNum(initial[1], 2),
									},
								]}
								// Max 20 steps (5,000,000 impressions step 1 ...)
								step={stepSetting || Math.floor((initial[1] || 100) / 20)}
								value={
									filterList[index].length > 0 ? filterList[index] : initial
								}
								onChange={(_, newValue) => {
									onChange(newValue, index, column)
								}}
								valueLabelDisplay='auto'
								aria-labelledby={`range-slider-${column.name}`}
								getAriaValueText={v => formatAbbrNum(v, 2)}
								valueLabelFormat={v => formatAbbrNum(v, 2)}
							/>
						</Box>
					</Box>
				)
			},
		},
	}
}