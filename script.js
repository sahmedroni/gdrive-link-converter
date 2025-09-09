function convertLink() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    if (mode === 'batch') {
        convertBatchLinks();
    } else {
        convertSingleLink();
    }
}

function convertSingleLink() {
    const inputLink = document.getElementById('inputLink').value.trim();
    const resultDiv = document.getElementById('result');
    const batchResultDiv = document.getElementById('batchResult');
    const errorDiv = document.getElementById('error');
    const outputLink = document.getElementById('outputLink');
    
    // Hide previous results
    resultDiv.style.display = 'none';
    batchResultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (!inputLink) {
        showError('Please paste a Google Drive link');
        return;
    }
    
    try {
        const convertedLink = convertGoogleDriveLink(inputLink);
        
        if (convertedLink) {
            outputLink.value = convertedLink;
            resultDiv.style.display = 'block';
        } else {
            showError('Invalid Google Drive link. Please make sure you\'re using a valid Google Drive share link.');
        }
    } catch (error) {
        showError('Error converting link: ' + error.message);
    }
}

function convertBatchLinks() {
    const inputText = document.getElementById('inputLink').value.trim();
    const resultDiv = document.getElementById('result');
    const batchResultDiv = document.getElementById('batchResult');
    const errorDiv = document.getElementById('error');
    const batchOutputLink = document.getElementById('batchOutputLink');
    const batchStats = document.getElementById('batchStats');
    
    // Hide previous results
    resultDiv.style.display = 'none';
    batchResultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (!inputText) {
        showError('Please paste Google Drive links (one per line)');
        return;
    }
    
    const lines = inputText.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
        showError('No valid links found');
        return;
    }
    
    const results = [];
    let successCount = 0;
    let failCount = 0;
    
    lines.forEach((line, index) => {
        if (line.includes('drive.google.com')) {
            const convertedLink = convertGoogleDriveLink(line);
            if (convertedLink) {
                results.push(`${index + 1}. ${convertedLink}`);
                successCount++;
            } else {
                results.push(`${index + 1}. [FAILED] ${line}`);
                failCount++;
            }
        } else {
            results.push(`${index + 1}. [INVALID] ${line}`);
            failCount++;
        }
    });
    
    batchOutputLink.value = results.join('\n');
    batchStats.innerHTML = `
        <strong>Conversion Results:</strong> 
        ${successCount} successful, ${failCount} failed out of ${lines.length} total links
    `;
    batchResultDiv.style.display = 'block';
}

function convertGoogleDriveLink(url) {
    // Remove any whitespace
    url = url.trim();
    
    // Pattern 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    let match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
        const fileId = match[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    
    // Pattern 2: https://drive.google.com/open?id=FILE_ID
    match = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (match) {
        const fileId = match[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    
    // Pattern 3: Already a direct link
    if (url.includes('drive.google.com/uc?') && url.includes('export=download')) {
        return url;
    }
    
    return null;
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function copyToClipboard() {
    const outputLink = document.getElementById('outputLink');
    const copyBtn = document.getElementById('copyBtn');
    
    outputLink.select();
    outputLink.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#2d8f47';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#34a853';
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
        showError('Failed to copy to clipboard. Please copy manually.');
    }
}

// Allow Enter key to trigger conversion
document.getElementById('inputLink').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        convertLink();
    }
});

function toggleMode() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const inputLink = document.getElementById('inputLink');
    const singleInstructions = document.getElementById('singleInstructions');
    const batchInstructions = document.getElementById('batchInstructions');
    
    if (mode === 'batch') {
        inputLink.placeholder = 'Paste multiple Google Drive links here (one per line)...';
        inputLink.rows = 6;
        singleInstructions.style.display = 'none';
        batchInstructions.style.display = 'block';
    } else {
        inputLink.placeholder = 'Paste your Google Drive share link here...';
        inputLink.rows = 3;
        singleInstructions.style.display = 'block';
        batchInstructions.style.display = 'none';
    }
    
    resetForm();
}

function resetForm() {
    // Clear input
    document.getElementById('inputLink').value = '';
    
    // Hide result and error boxes
    document.getElementById('result').style.display = 'none';
    document.getElementById('batchResult').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    
    // Clear outputs
    document.getElementById('outputLink').value = '';
    document.getElementById('batchOutputLink').value = '';
    
    // Focus back to input
    document.getElementById('inputLink').focus();
}

function copyAllToClipboard() {
    const batchOutputLink = document.getElementById('batchOutputLink');
    const copyAllBtn = document.getElementById('copyAllBtn');
    
    batchOutputLink.select();
    batchOutputLink.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyAllBtn.textContent;
        copyAllBtn.textContent = 'Copied!';
        copyAllBtn.style.background = '#2d8f47';
        
        setTimeout(() => {
            copyAllBtn.textContent = originalText;
            copyAllBtn.style.background = '#34a853';
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
        showError('Failed to copy to clipboard. Please copy manually.');
    }
}

function downloadResults() {
    const batchOutputLink = document.getElementById('batchOutputLink');
    const content = batchOutputLink.value;
    
    if (!content) {
        showError('No results to download');
        return;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google-drive-links-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Auto-convert when user pastes a link
document.getElementById('inputLink').addEventListener('paste', function() {
    setTimeout(() => {
        const inputLink = this.value.trim();
        if (inputLink && inputLink.includes('drive.google.com')) {
            convertLink();
        }
    }, 100);
});