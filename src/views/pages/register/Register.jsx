import React from 'react';
import {Container, Grid2, Typography, TextField, Button, Box, InputAdornment} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const Registration = () => {
	return (
		<Container maxWidth="xl" style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<Box sx={{ width: '100%', maxWidth: '700px', color: '', boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
				<Grid2 container style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
					<Grid2 item xs={12} style={{ alignContent: 'center', alignItems: 'center', textAlign: 'center', color: '#232F3E', width: '100%' }}>
						<Typography variant="h4" gutterBottom>
							Register
						</Typography>
						<Typography variant="subtitle1" gutterBottom>
							Create your account
						</Typography>
					</Grid2>
					<Grid2 item xs={12}>
						<Box component="form" sx={{ mt: 3, width: '100%' }}>
							<TextField
								label="First Name"
								variant="filled"
								fullWidth
								required
								margin="normal"
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<PersonIcon style={{color: 'green'}} />
											</InputAdornment>
										)
									}
								}}
							/>
							<TextField
								label="Last Name"
								variant="filled"
								fullWidth
								required
								margin="normal"
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<PersonIcon style={{color: 'green'}} />
											</InputAdornment>
										)
									}
								}}
							/>
							<TextField
								label="Professional Email"
								variant="filled"
								fullWidth
								required
								margin="normal"
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<EmailIcon style={{color: 'green'}} />
											</InputAdornment>
										)
									}
								}}
							/>
							<TextField
								label="Password"
								type="password"
								variant="filled"
								fullWidth
								required
								margin="normal"
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<LockIcon style={{color: 'green'}} />
											</InputAdornment>
										)
									}
								}}
							/>
							<TextField
								label="Repeat Password"
								type="password"
								variant="filled"
								fullWidth
								required
								margin="normal"
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<LockIcon style={{color: 'green'}} />
											</InputAdornment>
										),
									}
								}}
							/>
							<Button type="submit" fullWidth variant="contained" sx={{ backgroundColor: '#629C44', mt: 5 }}>
								Register
							</Button>
						</Box>
					</Grid2>
				</Grid2>
			</Box>
		</Container>
	);
};

export default Registration;
