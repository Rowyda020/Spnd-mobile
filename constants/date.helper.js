export const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);

    // Check if date is actually valid
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }

    // Modern "neat" format: "May 20, 2024"
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};