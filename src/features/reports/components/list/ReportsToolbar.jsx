import PropTypes from 'prop-types';
import { Autocomplete, Box, Button, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import QuotaIndicator from '../../../../components/demo/QuotaIndicator.jsx';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Search, job filter, sort and CSV export above the report list. */
const ReportsToolbar = ({ demo, exportLoading, fetchJobOptions, filterConfidence, filterRecommendation, handleConfidenceChange, handleExportCsv, handleJobAutocompleteChange, handleRecommendationChange, handleSearchChange, jobInputValue, jobOptions, jobOptionsLoading, jobSearchRef, searchTerm, selectedJobFilter, selectedJobId, setJobInputValue, setSortOrder, sortOrder }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 1.5,
			px: 2, py: 1.5,
			backgroundColor: tokens.surface.paper,
			borderBottom: `1px solid ${tokens.line.main}`,
			flexShrink: 0,
			flexWrap: 'wrap',
		}}>
			<AssessmentOutlinedIcon sx={{ color: tokens.brand.text, fontSize: tokens.iconSize.lg }} />
			<Typography sx={{ fontWeight: 600, fontSize: tokens.fontSize.body, color: tokens.ink.strong, mr: 1 }}>
				{t('appReportContent.reportListTitle')}
			</Typography>

			<Box sx={{ flex: 1, minWidth: 160 }}>
				<TextField
					size="small"
					placeholder={t('appReportContent.search')}
					value={searchTerm}
					onChange={handleSearchChange}
					fullWidth
					sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: tokens.fontSize.body2 } }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchOutlinedIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.ink.subtle }} />
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
							sx: { borderRadius: 2, fontSize: tokens.fontSize.body2 },
						}}
						InputLabelProps={{ sx: { fontSize: tokens.fontSize.body2 } }}
					/>
				)}
				renderOption={(props, opt) => (
					<li {...props} key={opt.id} style={{ fontSize: tokens.fontSize.body2 }}>
						{opt.title || opt.jobTitle || opt.name || opt.id}
					</li>
				)}
				noOptionsText={<Typography sx={{ fontSize: tokens.fontSize.body2 }}>{t('appReportContent.allJobs')}</Typography>}
			/>

			<FormControl size="small" sx={{ minWidth: 190 }}>
					<InputLabel sx={{ fontSize: tokens.fontSize.body2 }}>{t('appReportContent.filterByRecommendation')}</InputLabel>
					<Select
						value={filterRecommendation}
						label={t('appReportContent.filterByRecommendation')}
						onChange={handleRecommendationChange}
						sx={{ borderRadius: 2, fontSize: tokens.fontSize.body2 }}
					>
						<MenuItem value="">{t('appReportContent.allRecommendations')}</MenuItem>
						{['strong_interview', 'interview', 'may_be', 'reject'].map((key) => (
							<MenuItem key={key} value={key} sx={{ fontSize: tokens.fontSize.body2 }}>
								{t(`appCVMatching.recommendation.${key}`)}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl size="small" sx={{ minWidth: 170 }}>
					<InputLabel sx={{ fontSize: tokens.fontSize.body2 }}>{t('appReportContent.filterByConfidence')}</InputLabel>
					<Select
						value={filterConfidence}
						label={t('appReportContent.filterByConfidence')}
						onChange={handleConfidenceChange}
						sx={{ borderRadius: 2, fontSize: tokens.fontSize.body2 }}
					>
						<MenuItem value="">{t('appReportContent.allConfidences')}</MenuItem>
						{['high', 'medium', 'low'].map((key) => (
							<MenuItem key={key} value={key} sx={{ fontSize: tokens.fontSize.body2 }}>
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
						border: `1px solid ${tokens.line.main}`, borderRadius: 1.5,
						color: tokens.ink.muted,
						'&:hover': { backgroundColor: tokens.surface.muted },
					}}
				>
					{sortOrder === 'asc'
						? <ArrowUpwardOutlinedIcon sx={{ fontSize: tokens.iconSize.lg }} />
						: <ArrowDownwardOutlinedIcon sx={{ fontSize: tokens.iconSize.lg }} />
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
								: <FileDownloadOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />
							}
							sx={{
								borderRadius: 1.5, textTransform: 'none', fontSize: tokens.fontSize.body2,
								borderColor: tokens.line.main, color: tokens.ink.soft,
								'&:hover': { borderColor: tokens.brand.main, color: tokens.brand.text, backgroundColor: alpha(tokens.brand.main, 0.05) },
								'&.Mui-disabled': { borderColor: tokens.line.main, color: tokens.ink.faint },
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
