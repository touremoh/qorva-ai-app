import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	Grid,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Chip,
	Switch,
	Stack,
	CircularProgress,
	Alert,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveIcon from '@mui/icons-material/Remove';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../../../services/registrationService.js';

const PLAN_FEATURES = {
	Starter: [
		{ labelKey: 'pricing.features.freeTrial', included: true },
		{ labelKey: 'pricing.starter.users', included: true },
		{ labelKey: 'pricing.starter.matchingActions', included: true },
		{ labelKey: 'pricing.starter.aiChat', included: true },
		{ labelKey: 'pricing.starter.queries', included: true },
		{ labelKey: 'pricing.features.brandedCvExport', included: false },
		{ labelKey: 'pricing.features.brandedMatchReport', included: false },
		{ labelKey: 'pricing.features.accountManager', included: false },
		{ labelKey: 'pricing.features.sla', included: false },
	],
	Pro: [
		{ labelKey: 'pricing.features.freeTrial', included: true },
		{ labelKey: 'pricing.pro.users', included: true },
		{ labelKey: 'pricing.pro.matchingActions', included: true },
		{ labelKey: 'pricing.pro.aiChat', included: true },
		{ labelKey: 'pricing.pro.queries', included: true },
		{ labelKey: 'pricing.features.brandedCvExport', included: false },
		{ labelKey: 'pricing.features.brandedMatchReport', included: false },
		{ labelKey: 'pricing.features.accountManager', included: false },
		{ labelKey: 'pricing.features.sla', included: false },
	],
	Scale: [
		{ labelKey: 'pricing.features.freeTrial', included: true },
		{ labelKey: 'pricing.scale.users', included: true },
		{ labelKey: 'pricing.scale.matchingActions', included: true },
		{ labelKey: 'pricing.scale.aiChat', included: true },
		{ labelKey: 'pricing.scale.queries', included: true },
		{ labelKey: 'pricing.features.brandedCvExport', included: true },
		{ labelKey: 'pricing.features.brandedMatchReport', included: true },
		{ labelKey: 'pricing.features.accountManager', included: true },
		{ labelKey: 'pricing.features.sla', included: true },
	],
};

const formatPrice = (unitAmount, currency) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: (currency || 'usd').toUpperCase(),
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(unitAmount / 100);

const PricingCard = styled(Box)(({ theme, recommended, selected }) => ({
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	borderRadius: '20px',
	padding: theme.spacing(3.5),
	background: recommended
		? 'linear-gradient(145deg, #1a2940 0%, #232F3E 55%, #2d3f54 100%)'
		: '#ffffff',
	border: recommended
		? 'none'
		: selected
			? '2px solid #629C44'
			: '1px solid rgba(0,0,0,0.07)',
	boxShadow: recommended
		? selected
			? '0 0 0 2px #629C44, 0 24px 48px -12px rgba(35,47,62,0.4)'
			: '0 24px 48px -12px rgba(35,47,62,0.35)'
		: selected
			? '0 8px 24px rgba(98,156,68,0.2)'
			: '0 4px 16px rgba(0,0,0,0.06)',
	transition: 'transform 0.25s ease, box-shadow 0.25s ease',
	position: 'relative',
	cursor: 'pointer',
	'&:hover': {
		transform: 'translateY(-5px)',
		boxShadow: recommended
			? '0 32px 56px -12px rgba(35,47,62,0.45)'
			: '0 12px 28px rgba(0,0,0,0.1)',
	},
}));

const QorvaPricingTable = ({ selectedPriceId, onSelectPlan }) => {
	const { t } = useTranslation();
	const [yearly, setYearly] = useState(true);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		getProducts()
			.then((res) => {
				const sorted = (res.data?.data || []).sort((a, b) => {
					const aAmt = a.prices.find((p) => p.interval === 'month')?.unitAmount ?? 0;
					const bAmt = b.prices.find((p) => p.interval === 'month')?.unitAmount ?? 0;
					return aAmt - bAmt;
				});
				setProducts(sorted);
			})
			.catch(() => setError(t('pricing.loadError', 'Failed to load plans. Please try again.')))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
				<CircularProgress sx={{ color: '#629C44' }} />
			</Box>
		);
	}

	if (error) {
		return <Alert severity="error">{error}</Alert>;
	}

	return (
		<Box>
			{/* Billing toggle */}
			<Stack direction="row" spacing={1} alignItems="center" justifyContent="center" flexWrap="wrap" sx={{ mb: 4, gap: 1 }}>
				<Typography
					variant="body2"
					fontWeight={!yearly ? 600 : 400}
					color={!yearly ? 'text.primary' : 'text.secondary'}
				>
					{t('pricing.monthly', 'Monthly')}
				</Typography>
				<Switch
					checked={yearly}
					onChange={(e) => setYearly(e.target.checked)}
					sx={{
						'& .MuiSwitch-switchBase.Mui-checked': { color: '#629C44' },
						'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#629C44' },
					}}
				/>
				<Typography
					variant="body2"
					fontWeight={yearly ? 600 : 400}
					color={yearly ? 'text.primary' : 'text.secondary'}
				>
					{t('pricing.yearly', 'Yearly')}
				</Typography>
				{yearly && (
					<Chip
						label={t('pricing.saveChip', 'Save 20%')}
						size="small"
						sx={{
							background: 'linear-gradient(135deg, #629C44, #518136)',
							color: '#fff',
							fontWeight: 600,
							fontSize: '0.72rem',
						}}
					/>
				)}
			</Stack>

			{/* Plan cards */}
			<Grid container spacing={3} alignItems="stretch">
				{products.map((product) => {
					const isRecommended = product.name === 'Pro';
					const monthlyPrice = product.prices.find((p) => p.interval === 'month');
					const yearlyPrice = product.prices.find((p) => p.interval === 'year');
					const activePrice = yearly ? yearlyPrice : monthlyPrice;
					const priceId = activePrice?.stripePriceId;
					const isSelected = selectedPriceId === priceId;
					const features = PLAN_FEATURES[product.name] || [];
					const currency = activePrice?.currency || 'usd';
					const displayMonthly = yearly
						? Math.round((yearlyPrice?.unitAmount ?? 0) / 12)
						: (monthlyPrice?.unitAmount ?? 0);

					return (
						<Grid item xs={12} md={4} key={product.id}>
							<PricingCard
								recommended={isRecommended ? 1 : 0}
								selected={isSelected ? 1 : 0}
								onClick={() => onSelectPlan(priceId)}
							>
								{isRecommended && (
									<Chip
										label={t('pricing.mostPopular', 'Most Popular')}
										size="small"
										sx={{
											position: 'absolute',
											top: 16,
											right: 16,
											background: 'rgba(98,156,68,0.22)',
											color: '#a3c988',
											fontWeight: 700,
											fontSize: '0.68rem',
											border: '1px solid rgba(98,156,68,0.4)',
										}}
									/>
								)}

								{isSelected && (
									<CheckCircleIcon
										sx={{ position: 'absolute', top: 16, left: 16, fontSize: 20, color: '#629C44' }}
									/>
								)}

								<Typography
									variant="overline"
									sx={{
										fontWeight: 700,
										letterSpacing: 1.5,
										color: isRecommended ? 'rgba(255,255,255,0.7)' : 'text.secondary',
										mb: 1.5,
										display: 'block',
										mt: isSelected ? 2.5 : 0,
									}}
								>
									{product.name}
								</Typography>

								<Stack direction="row" alignItems="flex-end" spacing={0.5} sx={{ mb: 0.5 }}>
									<Typography
										component="span"
										sx={{
											fontWeight: 800,
											fontSize: { xs: '1.65rem', md: '2rem' },
											color: isRecommended ? '#fff' : 'text.primary',
											lineHeight: 1,
										}}
									>
										{formatPrice(displayMonthly, currency)}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											color: isRecommended ? 'rgba(255,255,255,0.6)' : 'text.secondary',
											mb: 0.4,
										}}
									>
										{t('pricing.periodMonthly', '/mo')}
									</Typography>
								</Stack>

								{yearly && yearlyPrice && (
									<Typography
										variant="caption"
										sx={{
											color: isRecommended ? 'rgba(255,255,255,0.45)' : 'text.disabled',
											display: 'block',
											mb: 2,
										}}
									>
										{t('pricing.billedYearly', 'Billed {{price}}/year', {
											price: formatPrice(yearlyPrice.unitAmount, currency),
										})}
									</Typography>
								)}

								<Box
									sx={{
										height: '1px',
										background: isRecommended ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
										mb: 2.5,
									}}
								/>

								<List disablePadding sx={{ flexGrow: 1, mb: 3 }}>
									{features.map((feat, idx) => (
										<ListItem key={idx} sx={{ px: 0, py: 0.6 }}>
											<ListItemIcon sx={{ minWidth: 28 }}>
												{feat.included ? (
													<CheckCircleOutlineIcon
														sx={{
															fontSize: 16,
															color: isRecommended ? 'rgba(255,255,255,0.85)' : '#629C44',
														}}
													/>
												) : (
													<RemoveIcon
														sx={{
															fontSize: 16,
															color: isRecommended ? 'rgba(255,255,255,0.2)' : 'text.disabled',
														}}
													/>
												)}
											</ListItemIcon>
											<ListItemText
												primary={t(feat.labelKey)}
												primaryTypographyProps={{
													variant: 'body2',
													sx: {
														fontSize: '0.78rem',
														color: feat.included
															? isRecommended ? '#fff' : 'text.primary'
															: isRecommended ? 'rgba(255,255,255,0.28)' : 'text.disabled',
														fontWeight: feat.included ? 500 : 400,
													},
												}}
											/>
										</ListItem>
									))}
								</List>

								<Button
									fullWidth
									variant="contained"
									size="medium"
									onClick={(e) => { e.stopPropagation(); onSelectPlan(priceId); }}
									sx={{
										borderRadius: '10px',
										py: 1.2,
										fontWeight: 600,
										textTransform: 'none',
										fontSize: '0.88rem',
										...(isSelected && {
											backgroundColor: '#629C44',
											'&:hover': { backgroundColor: '#518136' },
										}),
										...(isRecommended && !isSelected && {
											backgroundColor: '#fff',
											color: '#232F3E',
											'&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
										}),
										...(!isRecommended && !isSelected && {
											backgroundColor: 'transparent',
											border: '1.5px solid rgba(98,156,68,0.6)',
											color: '#629C44',
											boxShadow: 'none',
											'&:hover': {
												backgroundColor: 'rgba(98,156,68,0.06)',
												borderColor: '#629C44',
												boxShadow: 'none',
											},
										}),
									}}
								>
									{isSelected
										? t('pricing.selected', 'Selected')
										: t('pricing.selectPlan', 'Select Plan')}
								</Button>
							</PricingCard>
						</Grid>
					);
				})}
			</Grid>
		</Box>
	);
};

export default QorvaPricingTable;
