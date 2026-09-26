import PropTypes from 'prop-types';
import { getInitials } from '../../../../shared/lib/text.js';
import { Avatar, Box, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { getRoleFromAuthorities, ROLE_LABELS } from '../../model/users.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** The team: one row per user with role and actions. */
const UsersTable = ({ currentEmail, demo, loadingUsers, openEditPermissions, setUserToDelete, userDisplayName, users }) => {
	const { t } = useTranslation();
	return (
		<>
		<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, overflow: 'hidden' }}>
			{loadingUsers ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
					<CircularProgress size={24} sx={{ color: tokens.brand.text }} />
				</Box>
			) : users.length === 0 ? (
				<Box sx={{ py: 4, textAlign: 'center' }}>
					<Typography sx={{ fontSize: '0.82rem', color: tokens.ink.subtle }}>
						{t('accountSettings.noUsers')}
					</Typography>
				</Box>
			) : (
				<TableContainer>
					<Table size="small">
						<TableHead>
							<TableRow sx={{ backgroundColor: tokens.surface.subtle }}>
								{['tableUser', 'tableEmail', 'tableRole', 'tableActions'].map(key => (
									<TableCell key={key} sx={{ fontSize: '0.65rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${tokens.line.main}`, py: 1 }}>
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
										'&:hover': { backgroundColor: isSelf ? alpha(tokens.brand.main, 0.06) : `${tokens.surface.subtle}` },
										...(isSelf && { backgroundColor: alpha(tokens.brand.main, 0.05) }),
									}}>
										<TableCell sx={{ py: 1.25 }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700, backgroundColor: isSelf ? alpha(tokens.brand.main, 0.25) : alpha(tokens.brand.main, 0.12), color: tokens.brand.text }}>
													{initials}
												</Avatar>
												<Typography sx={{ fontSize: '0.82rem', fontWeight: isSelf ? 700 : 500, color: tokens.ink.strong }}>
													{userDisplayName(user)}
												</Typography>
												{isSelf && (
													<Chip size="small" label={t('accountSettings.you', 'You')}
														sx={{ fontSize: '0.6rem', height: 16, backgroundColor: alpha(tokens.brand.main, 0.12), color: tokens.brand.text, fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }} />
												)}
											</Box>
										</TableCell>
										<TableCell sx={{ fontSize: '0.82rem', color: tokens.ink.soft, py: 1.25 }}>
											{user.email || '—'}
										</TableCell>
										<TableCell sx={{ py: 1.25 }}>
											<Chip
												size="small"
												label={ROLE_LABELS[role] || t('accountSettings.roleManager', 'Manager')}
												sx={{
													fontSize: '0.68rem', height: 18,
													backgroundColor: role === 'ACCOUNT_OWNER' ? alpha(tokens.brand.main, 0.12) : `${tokens.surface.muted}`,
													color: role === 'ACCOUNT_OWNER' ? `${tokens.brand.main}` : `${tokens.ink.soft}`,
													fontWeight: role === 'ACCOUNT_OWNER' ? 700 : 400,
													'& .MuiChip-label': { px: 0.75 },
												}}
											/>
										</TableCell>
										<TableCell sx={{ py: 1.25 }}>
											<Box sx={{ display: 'flex', gap: 0.5 }}>
												{!demo && (
													<Tooltip title={t('accountSettings.managePermissions')}>
														<IconButton size="small" onClick={() => openEditPermissions(user)} sx={{ color: tokens.ink.muted, '&:hover': { color: tokens.brand.text } }}>
															<ManageAccountsOutlinedIcon sx={{ fontSize: 16 }} />
														</IconButton>
													</Tooltip>
												)}
												{!demo && (
													<Tooltip title={isSelf ? t('accountSettings.cannotDeleteSelf', 'You cannot delete your own account') : t('accountSettings.deleteUser')}>
														<span>
															<IconButton size="small" onClick={() => setUserToDelete(user)} disabled={isSelf}
																sx={{ color: tokens.ink.subtle, '&:hover': { color: tokens.status.error.bright }, '&.Mui-disabled': { color: tokens.ink.faintest } }}>
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
