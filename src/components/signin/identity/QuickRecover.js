import React, { useEffect } from 'react'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { t } from 'selectors'
import { execute, onUploadLocalWallet, getQuickWalletSalt } from 'actions'
import { validEmail } from 'helpers/validators'

const useStyles = makeStyles(styles)

const QuickRecover = ({ validate, handleChange, identity, invalidFields }) => {
	const classes = useStyles()
	const { email, uploadedLocalWallet } = identity
	const emailErr = invalidFields.email

	const validateEmail = async (email, dirty) => {
		const isValid = validEmail(email)

		if (isValid) {
			const hasSalt = await execute(getQuickWalletSalt({ email }))
			validate('email', {
				isValid: !!hasSalt,
				err: { msg: 'ERR_EMAIL_BACKUP_NOT_FOUND' },
				dirty: dirty,
			})
		} else {
			validate('email', {
				isValid: isValid,
				err: { msg: 'ERR_EMAIL' },
				dirty: dirty,
			})
		}
	}

	useEffect(() => {
		validateEmail(email, false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Grid container spacing={2} alignContent='flex-start' alignItems='center'>
			<Grid item xs={12}>
				<TextField
					fullWidth
					type='text'
					required
					label={t('email', { isProp: true })}
					name='email'
					value={identity.email || ''}
					onChange={ev => handleChange('email', ev.target.value)}
					onBlur={() => validateEmail(email, true)}
					onFocus={() => validateEmail(email, false)}
					error={emailErr && !!emailErr.dirty}
					maxLength={128}
					helperText={
						emailErr && !!emailErr.dirty
							? emailErr.errMsg
							: t('ENTER_VALID_EMAIL')
					}
				/>
			</Grid>
			{uploadedLocalWallet && (
				<Typography paragraph variant='subheading'>
					{t('UPLOADED_WALLET_KEY', { args: [uploadedLocalWallet] })}
					{' ' + uploadedLocalWallet}
				</Typography>
			)}
			<Grid item xs={12}>
				<input
					accept='text/json'
					className={classes.input}
					id='contained-button-file'
					type='file'
					onChange={ev => execute(onUploadLocalWallet(ev))}
				/>
				<label htmlFor='contained-button-file'>
					<Button component='span' className={classes.button}>
						{t('UPLOAD_ACCOUNT_DATA_JSON')}
					</Button>
				</label>
			</Grid>
		</Grid>
	)
}

const IdentityQuickRecoverStep = IdentityHoc(QuickRecover)
export default IdentityQuickRecoverStep
