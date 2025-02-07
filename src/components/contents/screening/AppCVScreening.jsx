// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
// import { useTranslation } from 'react-i18next';
import AppScreeningCommands from "./AppScreeningCommands.jsx";
import AppScreeningJobPostDetails from "./AppScreeningJobPostDetails.jsx";
import AppScreeningReportDetails from "./AppScreeningReportDetails.jsx";
import apiClient from "../../../../axiosConfig.js";
import i18n from "../../../i18n.js";
import {AUTH_TOKEN} from "../../../constants.js";

const AppCVScreening = () => {
	// const { t } = useTranslation();
	const [jobPosts, setJobPosts] = useState([]);
	const [cvEntries, setCvEntries] = useState([]);
	const [selectedJobPost, setSelectedJobPost] = useState('');
	const [selectedCVs, setSelectedCVs] = useState([]);
	const [selectedJobDetails, setSelectedJobDetails] = useState(null);
	const [analysisResult, setAnalysisResult] = useState(null);
	const [loading, setLoading] = useState(false);
	//const [isReportAvailable, setIsReportAvailable] = useState(false);
	const [saveReportButtonDisabled, setSaveReportButtonDisabled] = useState(true);

	// Fetch job posts and CV entries from backend API
	const fetchJobs = async () => {
		try {
			const response = await apiClient.get(import.meta.env.VITE_APP_API_JOB_POSTS_URL);
			setJobPosts(response.data?.data.content);
		} catch (error) {
			console.error('Error fetching job posts:', error.toJSON());
		}
	};

	const fetchCVEntries = async (pageNumber = 0, pageSize = 500) => {
		try {
			const response = await apiClient.get(import.meta.env.VITE_APP_API_CV_URL, {
				params: {
					pageNumber,
					pageSize
				}
			});
			setCvEntries(response.data?.data.content);
		} catch (error) {
			console.error('Error fetching CV entries:', error);
		}
	};

	useEffect(() => {
		fetchJobs().then(() => console.log("Job entries fetched"));
		fetchCVEntries().then(() => console.log("CV entries fetched"));
	}, []);

	const handleJobPostChange = (event) => {
		const selectedJob = jobPosts.find(job => job.id === event.target.value);
		setSelectedJobPost(event.target.value);
		setSelectedJobDetails(selectedJob);
	};

	const handleCVSelectChange = (event) => {
		setSelectedCVs(event.target.value);
	};

	const handleAnalyzeCVs = async () => {
		setLoading(true);
		setSaveReportButtonDisabled(true);
		try {

			const response = await apiClient.post(import.meta.env.VITE_APP_API_GEN_REPORT_URL,
				{
					jobPostId: selectedJobPost,
					cvIDs: selectedCVs
				},
				{
					headers: {
						'Accept-Language': i18n.language
					}
				}
			);
			if (response.status === 200) {
				setAnalysisResult(response.data.data);
				//setIsReportAvailable(true);
				setSaveReportButtonDisabled(false);
			}
		} catch (error) {
			console.error('Error analyzing CVs:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				width: '70vw',
				height: '100vh',
				marginLeft: { xs: '5%', md: '15%' },
				marginRight: { xs: '5%', md: '15%' },
				marginTop: 5,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				backgroundColor: 'transparent',
				color: '#232F3E',
				padding: 2,
			}}
		>
			{/* Section A: Command Controls */}
			<AppScreeningCommands
				jobPosts={jobPosts}
				cvEntries={cvEntries}
				selectedCVs={selectedCVs}
				handleAnalyzeCVs={handleAnalyzeCVs}
				handleCVSelectChange={handleCVSelectChange}
				handleJobPostChange={handleJobPostChange}
				selectedJobPost={selectedJobPost}
				analyzedResults={analysisResult}
				analyzeButtonDisabled={loading}
				saveReportButtonDisabled={saveReportButtonDisabled}
				setCVEntries={setCvEntries}
			/>

			{/* Section B: Job Post Details and Analytics */}
			<Box sx={{ display: 'flex', width: '100%', mt: 4 }}>
				{/* Job Post Details */}
				<AppScreeningJobPostDetails selectedJobDetails={selectedJobDetails} />

				{/* Section C: Analysis Result */}
				<AppScreeningReportDetails reportData={analysisResult} />
			</Box>
		</Box>
	);
};

export default AppCVScreening;
