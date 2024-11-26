const fileInput = document.getElementById('file-input');
const contactSheet = document.getElementById('contact-sheet');
const downloadBtn = document.getElementById('download-btn');

// Handle file input
fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
});

// Process uploaded files
async function handleFiles(files) {
    const validExtensions = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
    contactSheet.innerHTML = ''; // Clear previous images

    for (const file of files) {
        if (validExtensions.includes(file.type)) {
            const container = document.createElement('div');
            container.classList.add('image-container');
            
            // Create filename label
            const filenameLabel = document.createElement('div');
            filenameLabel.classList.add('filename');
            filenameLabel.textContent = file.name;
            container.appendChild(filenameLabel);

            // Process image
            const img = document.createElement('img');
            try {
                if (file.type === 'image/heic') {
                    const blob = await heic2any({ blob: file, toType: 'image/jpeg' });
                    img.src = URL.createObjectURL(blob);
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => (img.src = e.target.result);
                    reader.readAsDataURL(file);
                }
            } catch (error) {
                alert(`Error processing ${file.name}: ${error.message}`);
                continue;
            }

            container.appendChild(img);
            contactSheet.appendChild(container);
        } else {
            alert(`${file.name} is not a supported file type.`);
        }
    }

    // Enable download button if images are added
    if (contactSheet.childNodes.length > 0) {
        downloadBtn.disabled = false;
    }
}

// Download contact sheet as PNG
downloadBtn.addEventListener('click', () => {
    html2canvas(contactSheet, { scale: 2, backgroundColor: '#fff' }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'contact-sheet.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});
