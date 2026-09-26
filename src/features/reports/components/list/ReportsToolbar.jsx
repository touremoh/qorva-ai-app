import PropTypes from 'prop-types';
import { Autocomplete, Box, Button, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import QuotaIndicator from '../../../../components/demo/QuotaIndicator.jsx';
import { useTranslation } from 'react-i18next';

/** Search, job filter, sort and CSV export above the report list. */
const ReportsToolbar = ({ demo, exportLoading, fetchJobOptions, filterConfidence, filterRecommendation, handleConfidenceChange, handleExportCsv, handleJobAutocompleteChange, handleRecommendationChange, handleSearchChange, jobInputValue, jobOptions, jobOptionsLoading, jobSearchRef, searchTerm, selectedJobFilter, selectedJobId, setJobInputValue, setSortOrder, sortOrder }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 1.5,
			px: 2, py: 1.5,
			backgroundColor: '#ffffff',
			borderBottom: '1px solid #e2e8f0',
			flexShrink: 0,
			flexWrap: 'wrap',
		}}>
			<AssessmentOutlinedIcon sx={{ color: '#629C44', fontSize: 20 }} />
			<Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', mr: 1 }}>
				{t('appReportContent.reportListTitle')}
			</Typography>

			<Box sx={{ flex: 1, minWidth: 160 }}>
				<TextField
					size="small"
					placeholder={t('appReportContent.search')}
					value={searchTerm}
					onChange={handleSearchChange}
					fullWidth
					sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem' } }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
							</InputAdornment>
						),
					}}
				/>
			</Box>

			<Autocomplete
				size="small"
				sx={{ minWidth: 200 }}
				options={jobOptions}
				loading={jobOptionsLoading}
				value={selectedJobFilter}
				inputValue={jobInputValue}
				getOptionLabel={(opt) => opt.title || opt.jobTitle || opt.name || opt.id}
				isOptionEqualToValue={(opt, val) => opt.id === val.id}
				onChange={handleJobAutocompleteChange}
				onInputChange={(_, val, reason) => {
					setJobInputValue(val);
					if (reason === 'input' || reason === 'clear') {
						clearTimeout(jobSearchRef.current);
						jobSearchRef.current = setTimeout(() => fetchJobOptions(val), 300);
					}
				}}
				onOpen={() => { if (jobOptions.length === 0) fetchJobOptions(); }}
				renderInput={(params) => (
					<TextField
						{...params}
						label={t('appReportContent.filterByJob')}
						InputProps={{
							...params.InputProps,
							endAdornment: (
								<>
									{jobOptionsLoading && <CircularProgress size={14} sx={{ mr: 0.5 }} />}
									{params.InputProps.endAdornment}
								</>
							),
							sx: { borderRadius: 2, fontSize: '0.82rem' },
						}}
						InputLabelProps={{ sx: { fontSize: '0.82rem' } }}
					/>
				)}
				renderOption={(props, opt) => (
					<li {...props} key={opt.id} style={{ fontSize: '0.82rem' }}>
						{opt.title || opt.jobTitle || opt.name || opt.id}
					</li>
				)}
				noOptionsText={<Typography sx={{ fontSize: '0.82rem' }}>{t('appReportContent.allJobs')}</Typography>}
			/>

			<FormControl size="small" sx={{ minWidth: 160 }}>
					<InputLabel sx={{ fontSize: '0.82rem' }}>{t('appReportContent.filterByRecommendation')}</InputLabel>
					<Select
						value={filterRecommendation}
						label={t('appReportContent.filterByRecommendation')}
						onChange={handleRecommendationChange}
						sx={{ borderRadius: 2, fontSize: '0.82rem' }}
					>
						<MenuItem value="">{t('appReportContent.allRecommendations')}</MenuItem>
						{['strong_interview', 'interview', 'may_be', 'reject'].map((key) => (
							<MenuItem key={key} value={key} sx={{ fontSize: '0.82rem' }}>
								{t(`appCVMatching.recommendation.${key}`)}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl size="small" sx={{ minWidth: 150 }}>
					<InputLabel sx={{ fontSize: '0.82rem' }}>{t('appReportContent.filterByConfidence')}</InputLabel>
					<Select
						value={filterConfidence}
						label={t('appReportContent.filterByConfidence')}
						onChange={handleConfidenceChange}
						sx={{ borderRadius: 2, fontSize: '0.82rem' }}
					>
						<MenuItem value="">{t('appReportContent.allConfidences')}</MenuItem>
						{['high', 'medium', 'low'].map((key) => (
							<MenuItem key={key} value={key} sx={{ fontSize: '0.82rem' }}>
								{t(`appCVMatching.confidence.${key}`)}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<Tooltip title={sortOrder === 'asc' ? t('appReportContent.sortDesc') : t('appReportContent.sortAsc')}>
				<IconButton
					size="small"
					onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
					sx={{
						border: '1px solid #e2e8f0', borderRadius: 1.5,
						color: '#64748b',
						'&:hover': { backgroundColor: '#f1f5f9' },
					}}
				>
					{sortOrder === 'asc'
						? <ArrowUpwardOutlinedIcon sx={{ fontSize: 18 }} />
						: <ArrowDownwardOutlinedIcon sx={{ fontSize: 18 }} />
					}
				</IconButton>
			</Tooltip>

			{demo ? (
				<QuotaIndicator />
			) : (
				<Tooltip title={!selectedJobId ? t('appReportContent.exportCsvSelectJob') : ''}>
					<span>
						<Button
							size="small"
							variant="outlined"
							onClick={handleExportCsv}
							disabled={!selectedJobId || exportLoading}
							startIcon={exportLoading
								? <CircularProgress size={14} color="inherit" />
								: <FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />
							}
							sx={{
								borderRadius: 1.5, textTransform: 'none', fontSize: '0.82rem',
								borderColor: '#e2e8f0', color: '#475569',
								'&:hover': { borderColor: '#629C44', color: '#629C44', backgroundColor: 'rgba(98,156,68,0.05)' },
								'&.Mui-disabled': { borderColor: '#e2e8f0', color: '#cbd5e1' },
							}}
						>
							{t('appReportContent.exportCsv')}
						</Button>
					</span>
				</Tooltip>
			)}
		</Box>
		</>
	);
};

ReportsToolbar.propTypes = {
	demo: PropTypes.bool,
	exportLoading: PropTypes.any,
	fetchJobOptions: PropTypes.any,
	filterConfidence: PropTypes.any,
	filterRecommendation: PropTypes.any,
	handleConfidenceChange: PropTypes.func,
	handleExportCsv: PropTypes.func,
	handleJobAutocompleteChange: PropTypes.func,
	handleRecommendationChange: PropTypes.func,
	handleSearchChange: PropTypes.func,
	jobInputValue: PropTypes.any,
	jobOptions: PropTypes.any,
	jobOptionsLoading: PropTypes.any,
	jobSearchRef: PropTypes.any,
	searchTerm: PropTypes.any,
	selectedJobFilter: PropTypes.any,
	selectedJobId: PropTypes.any,
	setJobInputValue: PropTypes.func,
	setSortOrder: PropTypes.func,
	sortOrder: PropTypes.any,
};

export default ReportsToolbar;
