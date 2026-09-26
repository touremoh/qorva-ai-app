/** Saves `data` as a file named `filename` through a temporary link (the browser's download flow). */
export function saveBlob(data, filename) {
	const url = window.URL.createObjectURL(new Blob([data]));
	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', filename);
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}
