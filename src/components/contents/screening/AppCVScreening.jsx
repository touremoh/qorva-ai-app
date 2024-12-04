// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {cvEntriesMock, mockJobs, candidatesEvaluation} from "../../../mocks.js";
import AppScreeningCommands from "./AppScreeningCommands.jsx";
import AppScreeningJobPostDetails from "./AppScreeningJobPostDetails.jsx";
import AppScreeningCVMatching from "./AppScreeningCVMatching.jsx";

const AppCVScreening = () => {
	const { t } = useTranslation();
	const [jobPosts, setJobPosts] = useState(mockJobs);
	const [cvEntries, setCvEntries] = useState(cvEntriesMock);
	const [selectedJobPost, setSelectedJobPost] = useState('');
	const [selectedCVs, setSelectedCVs] = useState([]);
	const [selectedJobDetails, setSelectedJobDetails] = useState(null);
	const [analysisResult, setAnalysisResult] = useState([]);

	// Fetch job posts and CV entries from backend API
	useEffect(() => {
		const fetchJobPosts = async () => {
			try {
				const response = await axios.get('/api/job-posts');
				setJobPosts(response.data);
			} catch (error) {
				console.error('Error fetching job posts:', error);
			}
		};

		const fetchCVEntries = async () => {
			try {
				const response = await axios.get('/api/cv-entries');
				setCvEntries(response.data);
			} catch (error) {
				console.error('Error fetching CV entries:', error);
			}
		};

		// fetchJobPosts();
		//fetchCVEntries();
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
		try {
			// const response = await axios.post('/api/analyze-cv', {
			// 	jobPostId: selectedJobPost,
			// 	cvIds: selectedCVs,
			// });
			// setAnalysisResult(response.data);
			setAnalysisResult(candidatesEvaluation);
		} catch (error) {
			console.error('Error analyzing CVs:', error);
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
			/>

			{/* Section B: Job Post Details and Analytics */}
			<Box sx={{ display: 'flex', width: '100%', mt: 4 }}>
				{/* Job Post Details */}
				<AppScreeningJobPostDetails selectedJobDetails={selectedJobDetails} />

				{/* Section C: Analysis Result */}
				<AppScreeningCVMatching analysisResults={analysisResult}/>
			</Box>
		</Box>
	);
};

export default AppCVScreening;
