import PropTypes from 'prop-types';
import { getInitials } from '../../../../shared/lib/text.js';
import { Avatar, Box, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { getRoleFromAuthorities, ROLE_LABELS } from '../../model/users.js';
import { useTranslation } from 'react-i18next';

/** The team: one row per user with role and actions. */
const UsersTable = ({ currentEmail, demo, loadingUsers, openEditPermissions, setUserToDelete, userDisplayName, users }) => {
	const { t } = useTranslation();
	return (
		<>
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflow: 'hidden' }}>
			{loadingUsers ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
					<CircularProgress size={24} sx={{ color: '#629C44' }} />
				</Box>
			) : users.length === 0 ? (
				<Box sx={{ py: 4, textAlign: 'center' }}>
					<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
						{t('accountSettings.noUsers')}
					</Typography>
				</Box>
			) : (
				<TableContainer>
					<Table size="small">
						<TableHead>
							<TableRow sx={{ backgroundColor: '#f8fafc' }}>
								{['tableUser', 'tableEmail', 'tableRole', 'tableActions'].map(key => (
									<TableCell key={key} sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', py: 1 }}>
										{t(`accountSettings.${key}`)}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{users.map((user) => {
								const isSelf = user.email === currentEmail;
								const role = getRoleFromAuthorities(user.authorities);
								const initials = getInitials([user.firstName, user.lastName], '?');
								return (
									<TableRow key={user.id} sx={{
										'&:last-child td': { borderBottom: 0 },
										'&:hover': { backgroundColor: isSelf ? 'rgba(98,156,68,0.06)' : '#f8fafc' },
										...(isSelf && { backgroundColor: 'rgba(98,156,68,0.05)' }),
									}}>
										<TableCell sx={{ py: 1.25 }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700, backgroundColor: isSelf ? 'rgba(98,156,68,0.25)' : 'rgba(98,156,68,0.12)', color: '#629C44' }}>
													{initials}
												</Avatar>
												<Typography sx={{ fontSize: '0.82rem', fontWeight: isSelf ? 700 : 500, color: '#0f172a' }}>
													{userDisplayName(user)}
												</Typography>
												{isSelf && (
													<Chip size="small" label={t('accountSettings.you', 'You')}
														sx={{ fontSize: '0.6rem', height: 16, backgroundColor: 'rgba(98,156,68,0.12)', color: '#629C44', fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }} />
												)}
											</Box>
										</TableCell>
										<TableCell sx={{ fontSize: '0.82rem', color: '#475569', py: 1.25 }}>
											{user.email || '—'}
										</TableCell>
										<TableCell sx={{ py: 1.25 }}>
											<Chip
												size="small"
												label={ROLE_LABELS[role] || t('accountSettings.roleManager', 'Manager')}
												sx={{
													fontSize: '0.68rem', height: 18,
													backgroundColor: role === 'ACCOUNT_OWNER' ? 'rgba(98,156,68,0.12)' : '#f1f5f9',
													color: role === 'ACCOUNT_OWNER' ? '#629C44' : '#475569',
													fontWeight: role === 'ACCOUNT_OWNER' ? 700 : 400,
													'& .MuiChip-label': { px: 0.75 },
												}}
											/>
										</TableCell>
										<TableCell sx={{ py: 1.25 }}>
											<Box sx={{ display: 'flex', gap: 0.5 }}>
												{!demo && (
													<Tooltip title={t('accountSettings.managePermissions')}>
														<IconButton size="small" onClick={() => openEditPermissions(user)} sx={{ color: '#64748b', '&:hover': { color: '#629C44' } }}>
															<ManageAccountsOutlinedIcon sx={{ fontSize: 16 }} />
														</IconButton>
													</Tooltip>
												)}
												{!demo && (
													<Tooltip title={isSelf ? t('accountSettings.cannotDeleteSelf', 'You cannot delete your own account') : t('accountSettings.deleteUser')}>
														<span>
															<IconButton size="small" onClick={() => setUserToDelete(user)} disabled={isSelf}
																sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' }, '&.Mui-disabled': { color: '#e2e8f0' } }}>
																<DeleteOutlineIcon sx={{ fontSize: 16 }} />
															</IconButton>
														</span>
													</Tooltip>
												)}
											</Box>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Paper>
		</>
	);
};

UsersTable.propTypes = {
	currentEmail: PropTypes.any,
	demo: PropTypes.bool,
	loadingUsers: PropTypes.any,
	openEditPermissions: PropTypes.func,
	setUserToDelete: PropTypes.func,
	userDisplayName: PropTypes.any,
	users: PropTypes.any,
};

export default UsersTable;
