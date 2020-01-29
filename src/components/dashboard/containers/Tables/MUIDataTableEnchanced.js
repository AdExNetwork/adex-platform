import React from 'react'
import MUIDataTable from 'mui-datatables'
import { theme } from 'components/App/themeMUi'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'

export default function MUIDataTableEnchanced(props) {
	const { title, data, columns, options } = props
	const getMuiTheme = () =>
		createMuiTheme({
			...theme,
			overrides: {
				MuiTableFooter: {
					root: {
						display: 'flex',
						flex: 0,
						padding: 0,
					},
				},
				MUIDataTablePagination: {
					toolbar: {
						padding: 0,
					},
				},
				MUIDataTableFilter: {
					root: {
						maxWidth: '400px',
					},
				},
				// Think of accessing an element not a class
				MuiGridListTile: {
					root: {
						width: '100% !important',
					},
				},
				MUIDataTableBodyCell: {
					stackedCommon: {
						height: '80px !important',
					},
				},
				...theme.overrides,
			},
			//TODO: mobile version fixes
		})
	const generalTableOptions = {
		rowsPerPage: 5,
		rowsPerPageOptions: [5, 10, 25, 50, 100, 500],
		setTableProps: () => {
			return {
				padding: 'default',
				size: 'small',
				tableLayout: 'auto',
				width: '100%',
				align: 'center',
				whiteSpace: 'wrap',
			}
		},
		textLabels: {
			body: {
				noMatch: 'Sorry, no matching records found',
				toolTip: 'Sort',
				columnHeaderTooltip: column => `Sort for ${column.label}`,
			},
			pagination: {
				next: 'Next Page',
				previous: 'Previous Page',
				rowsPerPage: 'Rows per page:',
				displayRows: 'of',
			},
			toolbar: {
				search: 'Search',
				downloadCsv: 'Download CSV',
				print: 'Print',
				viewColumns: 'View Columns',
				filterTable: 'Filter Table',
			},
			filter: {
				all: 'All',
				title: 'FILTERS',
				reset: 'RESET',
			},
			viewColumns: {
				title: 'Show Columns',
				titleAria: 'Show/Hide Table Columns',
			},
			selectedRows: {
				text: 'row(s) selected',
				delete: 'Delete',
				deleteAria: 'Delete Selected Rows',
			},
		},
	}
	return (
		<MuiThemeProvider theme={getMuiTheme()}>
			<MUIDataTable
				title={title}
				data={data}
				columns={columns}
				options={{
					...generalTableOptions,
					...options,
					download: !props.noDownload,
					print: !props.noPrint,
					selectableRows: props.rowSelectable ? 'multiple' : 'none',
					customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
						//This disables toolbar when selected elements on all tables
					},
				}}
			/>
		</MuiThemeProvider>
	)
}