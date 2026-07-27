// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	MenuItem,
	Paper,
	TextField,
	Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';

// Bare client on purpose: the app's apiClient injects auth headers and redirects on 401 —
// this page is public and must stay free of the authenticated shell's behavior.
const publicClient = axios.create({ baseURL: import.meta.env.VITE_APP_API_BASE_URL });

const AVAILABILITY_STATUSES = ['activelyLooking', 'openButNotSearching', 'notAvailable', 'freelanceOnly'];

const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 1.5, backgroundColor: '#f8fafc' } };

const CandidateUpdatePage = () => {
	const { t, i18n } = useTranslation();
	const { token } = useParams();
	const [searchParams] = useSearchParams();
	const unsubscribeMode = searchParams.get('unsubscribe') === 'true';

	const [state, setState] = useState('loading'); // loading | form | unsubscribe | done | unsubscribed | invalid
	const [prefill, setPrefill] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [form, setForm] = useState({
		availabilityStatus: '', availableFrom: '', noticePeriodDays: '',
		openToWork: true, salaryCurrency: '', salaryMin: '', salaryMax: '',
	});
	const [file, setFile] = useState(null);

	useEffect(() => {
		const load = async () => {
			try {
				const res = await publicClient.get(`/public/candidate-update/${token}`);
				const data = res.data?.data ?? res.data;
				setPrefill(data);
				if (data?.language) i18n.changeLanguage(data.language);
				setForm({
					availabilityStatus: data?.availabilityStatus ?? '',
					availableFrom: data?.availableFrom ?? '',
					noticePeriodDays: data?.noticePeriodDays ?? '',
					openToWork: data?.openToWork ?? true,
					salaryCurrency: data?.salaryCurrency ?? '',
					salaryMin: data?.salaryMin ?? '',
					salaryMax: data?.salaryMax ?? '',
				});
				setState(unsubscribeMode ? 'unsubscribe' : 'form');
			} catch {
				setState(unsubscribeMode ? 'unsubscribe' : 'invalid');
			}
		};
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			const submission = {
				availabilityStatus: form.availabilityStatus || null,
				availableFrom: form.availableFrom || null,
				noticePeriodDays: form.noticePeriodDays !== '' ? Number(form.noticePeriodDays) : null,
				openToWork: form.openToWork,
				salaryCurrency: form.salaryCurrency || null,
				salaryMin: form.salaryMin !== '' ? Number(form.salaryMin) : null,
				salaryMax: form.salaryMax !== '' ? Number(form.salaryMax) : null,
			};
			const payload = new FormData();
			payload.append('submission', new Blob([JSON.stringify(submission)], { type: 'application/json' }));
			if (file) payload.append('file', file);
			await publicClient.post(`/public/candidate-update/${token}`, payload);
			setState('done');
		} catch {
			setState('invalid');
		} finally {
			setSubmitting(false);
		}
	};

	const handleUnsubscribe = async () => {
		setSubmitting(true);
		try {
			await publicClient.post(`/public/candidate-update/${token}/unsubscribe`);
			setState('unsubscribed');
		} catch {
			setState('invalid');
		} finally {
			setSubmitting(false);
		}
	};

	const shell = (children) => (
		<Box sx={{
			position: 'fixed', inset: 0, overflowY: 'auto',
			background: 'linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)',
			display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2,
		}}>
			<Box sx={{ width: '100%', maxWidth: 520, display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
					<Box component="img" src="/logo.svg" alt="Qorva" sx={{ width: 28, height: 28 }} />
					<Typography sx={{ fontWeight: 700, color: '#0f172a' }}>Qorva</Typography>
				</Box>
				<LanguageSwitcher />
			</Box>
			<Paper elevation={0} sx={{ width: '100%', maxWidth: 520, borderRadius: 3, p: { xs: 2.5, sm: 4 }, boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}>
				{children}
			</Paper>
		</Box>
	);

	if (state === 'loading') {
		return shell(<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={26} /></Box>);
	}

	if (state === 'invalid') {
		return shell(
			<Alert severity="warning" sx={{ borderRadius: 1.5 }}>
				{t('candidateUpdate.invalid', 'This link is no longer valid. It may have expired or already been used.')}
			</Alert>
		);
	}

	if (state === 'done' || state === 'unsubscribed') {
		return shell(
			<Box sx={{ textAlign: 'center', py: 2 }}>
				<CheckCircleRoundedIcon sx={{ fontSize: 44, color: '#16a34a', mb: 1 }} />
				<Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
					{state === 'done'
						? t('candidateUpdate.doneTitle', 'Thank you — your profile is up to date!')
						: t('candidateUpdate.unsubscribedTitle', 'You have been unsubscribed.')}
				</Typography>
				<Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
					{state === 'done'
						? t('candidateUpdate.doneSubtitle', 'You can close this page.')
						: t('candidateUpdate.unsubscribedSubtitle', 'You will not receive further update requests.')}
				</Typography>
			</Box>
		);
	}

	if (state === 'unsubscribe') {
		return shell(
			<Box sx={{ textAlign: 'center', py: 1 }}>
				<Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
					{t('candidateUpdate.unsubscribeTitle', 'Unsubscribe from update requests?')}
				</Typography>
				<Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 2.5 }}>
					{t('candidateUpdate.unsubscribeSubtitle', 'You will no longer receive profile update emails from this recruiter.')}
				</Typography>
				<Button variant="contained" disabled={submitting} onClick={handleUnsubscribe}
					sx={{ textTransform: 'none', borderRadius: 1.5, backgroundColor: '#629C44', '&:hover': { backgroundColor: '#528035' }, boxShadow: 'none' }}>
					{submitting ? <CircularProgress size={16} color="inherit" /> : t('candidateUpdate.unsubscribeButton', 'Unsubscribe')}
				</Button>
			</Box>
		);
	}

	return shell(
		<Box>
			<Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', mb: 0.5 }}>
				{t('candidateUpdate.title', 'Hi {{name}}, keep your profile up to date', { name: prefill?.firstName || '' })}
			</Typography>
			<Typography sx={{ fontSize: '0.84rem', color: '#64748b', mb: 3 }}>
				{t('candidateUpdate.subtitle', 'Confirm your availability and expectations — it takes a minute.')}
			</Typography>

			<TextField select fullWidth size="small" label={t('candidateUpdate.status', 'Availability')}
				value={form.availabilityStatus}
				onChange={(e) => setForm(f => ({ ...f, availabilityStatus: e.target.value }))}
				sx={{ ...inputSx, mb: 2 }}>
				{AVAILABILITY_STATUSES.map(status => (
					<MenuItem key={status} value={status}>
						{t(`appCVContent.availability.statusValue.${status}`, status)}
					</MenuItem>
				))}
			</TextField>

			<Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
				<TextField fullWidth size="small" label={t('candidateUpdate.availableFrom', 'Available from')}
					placeholder="2026-09-01" value={form.availableFrom}
					onChange={(e) => setForm(f => ({ ...f, availableFrom: e.target.value }))} sx={inputSx} />
				<TextField fullWidth size="small" type="number" label={t('candidateUpdate.noticePeriod', 'Notice period (days)')}
					value={form.noticePeriodDays}
					onChange={(e) => setForm(f => ({ ...f, noticePeriodDays: e.target.value }))} sx={inputSx} />
			</Box>

			<Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
				<TextField size="small" label={t('candidateUpdate.currency', 'Currency')} placeholder="EUR"
					value={form.salaryCurrency} sx={{ ...inputSx, width: 110 }}
					onChange={(e) => setForm(f => ({ ...f, salaryCurrency: e.target.value.toUpperCase() }))} />
				<TextField fullWidth size="small" type="number" label={t('candidateUpdate.salaryMin', 'Salary min')}
					value={form.salaryMin} onChange={(e) => setForm(f => ({ ...f, salaryMin: e.target.value }))} sx={inputSx} />
				<TextField fullWidth size="small" type="number" label={t('candidateUpdate.salaryMax', 'Salary max')}
					value={form.salaryMax} onChange={(e) => setForm(f => ({ ...f, salaryMax: e.target.value }))} sx={inputSx} />
			</Box>

			<Button component="label" fullWidth variant="outlined" startIcon={<CloudUploadIcon sx={{ fontSize: 18 }} />}
				sx={{ textTransform: 'none', borderRadius: 1.5, borderColor: '#cbd5e1', color: file ? '#16a34a' : '#64748b', mb: 2, justifyContent: 'flex-start' }}>
				{file ? file.name : t('candidateUpdate.uploadCV', 'Upload a newer resume (optional, .pdf or .docx)')}
				<input type="file" hidden accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
			</Button>

			<Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mb: 2, lineHeight: 1.5 }}>
				{t('candidateUpdate.consent', 'By submitting, you agree that this information is shared with the recruiter who holds your profile and processed to keep it accurate.')}
			</Typography>

			<Button fullWidth variant="contained" disabled={submitting} onClick={handleSubmit}
				sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, py: 1.2, backgroundColor: '#629C44', '&:hover': { backgroundColor: '#528035' }, boxShadow: 'none' }}>
				{submitting ? <CircularProgress size={18} color="inherit" /> : t('candidateUpdate.submit', 'Update my profile')}
			</Button>
		</Box>
	);
};

export default CandidateUpdatePage;
