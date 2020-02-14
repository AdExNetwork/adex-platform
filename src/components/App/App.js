import React, { Component } from 'react'
import 'react-image-crop/dist/ReactCrop.css'
// import './App.css'
import { Provider } from 'react-redux'
import { persistor, store } from 'store'
import history from 'store/history'
import { ConnectedRouter } from 'connected-react-router'
import Toast from 'components/toast/Toast'
import Confirm from 'components/confirm/Confirm'
import { PersistGate } from 'redux-persist/integration/react'
import Root from './Root'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { themeMUI } from './themeMUi'
import MomentUtils from '@date-io/moment'
import { MuiPickersUtilsProvider } from 'material-ui-pickers'
import CssBaseline from '@material-ui/core/CssBaseline'
import CacheBuster from './CacheBuster'

// console.log('initial store', store.getState())

const onBeforeLift = () => {
	// take some action before the gate lifts
}

class App extends Component {
	render() {
		return (
			<React.Fragment>
				<CssBaseline />
				<MuiThemeProvider theme={themeMUI}>
					<MuiPickersUtilsProvider utils={MomentUtils}>
						<Provider store={store}>
							<PersistGate onBeforeLift={onBeforeLift} persistor={persistor}>
								<ConnectedRouter history={history}>
									<CacheBuster>
										<div className='adex-dapp'>
											<Root />
											<Toast />
											<Confirm />
										</div>
									</CacheBuster>
								</ConnectedRouter>
							</PersistGate>
						</Provider>
					</MuiPickersUtilsProvider>
				</MuiThemeProvider>
			</React.Fragment>
		)
	}
}

export default App